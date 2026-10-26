import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

import type { AuthUser } from './auth.types.js';

export interface AuthenticatedRequest extends Request {
  authUser?: AuthUser;
}

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Vui lòng đăng nhập');
    }

    const token = authorization.slice(7).trim();

    try {
      const payload = await this.jwtService.verifyAsync<AuthUser>(token, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        algorithms: ['HS256'],
      });

      if (payload.type !== 'access' || !payload.sub || !payload.role) {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      request.authUser = payload;
      return true;
    } catch {
      throw new UnauthorizedException(
        'Phiên đăng nhập không hợp lệ hoặc đã hết hạn',
      );
    }
  }
}
