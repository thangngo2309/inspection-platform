import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { compare, hash } from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';

import {
  Customer,
  User,
  UserSession,
} from '../entities/inspection.entities.js';

import {
  ADMIN_ROLES,
  UserRole,
  type AuthAccount,
  type AuthTokens,
} from './auth.types.js';

import type { LoginDto, RegisterDto } from './auth.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(UserSession)
    private readonly sessionRepo: Repository<UserSession>,

    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  private normalizePhone(phone: string): string {
    return phone.trim().replace(/[\s.-]/g, '');
  }

  private tokenHash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private accessTtl(): number {
    return Number(this.config.get<string>('JWT_ACCESS_TTL_SECONDS', '900'));
  }

  private refreshTtlDays(): number {
    return Number(this.config.get<string>('JWT_REFRESH_TTL_DAYS', '30'));
  }

  private toAccount(user: User): AuthAccount {
    return {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      role: user.role as UserRole,
      status: user.status,
    };
  }

  private async createAccessToken(user: User): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: user.id,
        role: user.role,
        type: 'access',
      },
      {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.accessTtl(),
        algorithm: 'HS256',
      },
    );
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const accessToken = await this.createAccessToken(user);
    const refreshToken = randomBytes(48).toString('hex');

    const expiresAt = new Date(Date.now() + this.refreshTtlDays() * 86400_000);

    await this.sessionRepo.save(
      this.sessionRepo.create({
        userId: user.id,
        refreshTokenHash: this.tokenHash(refreshToken),
        expiresAt,
        revokedAt: null,
        deviceName: null,
        ipAddress: null,
        userAgent: null,
      }),
    );

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      user: this.toAccount(user),
    };
  }

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const phone = this.normalizePhone(dto.phone);

    if (!/^0\d{9}$/.test(phone)) {
      throw new ConflictException('Số điện thoại không hợp lệ');
    }

    const existed = await this.userRepo.findOneBy({ phone });

    if (existed) {
      throw new ConflictException('Số điện thoại đã được đăng ký');
    }

    const passwordHash = await hash(dto.password, 12);

    try {
      const user = await this.dataSource.transaction(async (manager) => {
        const savedUser = await manager.save(
          User,
          manager.create(User, {
            phone,
            fullName: dto.fullName.trim(),
            email: dto.email?.trim().toLowerCase() || null,
            passwordHash,
            role: UserRole.CUSTOMER,
            status: 'active',
            lastLoginAt: null,
          }),
        );

        await manager.save(
          Customer,
          manager.create(Customer, {
            userId: savedUser.id,
            fullName: savedUser.fullName,
            phone: savedUser.phone,
            email: savedUser.email,
            address: null,
            phoneVerifiedAt: null,
            note: null,
          }),
        );

        return savedUser;
      });

      return this.issueTokens(user);
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException('Số điện thoại hoặc email đã được sử dụng');
      }
      throw error;
    }
  }

  async login(
    dto: LoginDto,
    audience: 'admin' | 'customer',
  ): Promise<AuthTokens> {
    const phone = this.normalizePhone(dto.phone);
    const user = await this.userRepo.findOneBy({ phone });

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Số điện thoại hoặc mật khẩu không đúng');
    }

    const valid = await compare(dto.password, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedException('Số điện thoại hoặc mật khẩu không đúng');
    }

    if (user.status !== 'active') {
      throw new ForbiddenException('Tài khoản đã bị vô hiệu hóa');
    }

    const allowed =
      audience === 'admin'
        ? ADMIN_ROLES.includes(user.role)
        : user.role === UserRole.CUSTOMER;

    if (!allowed) {
      throw new ForbiddenException(
        'Tài khoản không có quyền đăng nhập tại đây',
      );
    }

    user.lastLoginAt = new Date();
    await this.userRepo.save(user);

    return this.issueTokens(user);
  }

  async me(userId: string): Promise<AuthAccount> {
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Tài khoản không còn hoạt động');
    }

    return this.toAccount(user);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const currentHash = this.tokenHash(refreshToken);

    return this.dataSource.transaction(async (manager) => {
      const session = await manager
        .getRepository(UserSession)
        .createQueryBuilder('session')
        .setLock('pessimistic_write')
        .where('session.refreshTokenHash = :hash', {
          hash: currentHash,
        })
        .getOne();

      if (
        !session ||
        session.revokedAt ||
        session.expiresAt.getTime() <= Date.now()
      ) {
        throw new UnauthorizedException('Refresh token không hợp lệ');
      }

      const user = await manager.findOneBy(User, {
        id: session.userId,
      });

      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('Tài khoản không còn hoạt động');
      }

      const nextRefreshToken = randomBytes(48).toString('hex');

      session.revokedAt = new Date();
      await manager.save(UserSession, session);

      await manager.save(
        UserSession,
        manager.create(UserSession, {
          userId: user.id,
          refreshTokenHash: this.tokenHash(nextRefreshToken),
          expiresAt: new Date(Date.now() + this.refreshTtlDays() * 86400_000),
          revokedAt: null,
          deviceName: session.deviceName,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
        }),
      );

      return {
        accessToken: await this.createAccessToken(user),
        refreshToken: nextRefreshToken,
        tokenType: 'Bearer' as const,
        user: this.toAccount(user),
      };
    });
  }

  async logout(refreshToken: string): Promise<{ success: boolean }> {
    await this.sessionRepo.update(
      {
        refreshTokenHash: this.tokenHash(refreshToken),
      },
      { revokedAt: new Date() },
    );

    return { success: true };
  }
}
