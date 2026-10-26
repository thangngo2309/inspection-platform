import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';

import {
  Booking,
  CenterTimeSlot,
  StaffAssignment,
  StaffProfile,
  User,
} from '../entities/inspection.entities.js';
import { StaffSlotAvailability } from '../entities/staff-slot-availability.entity.js';

import { CreateStaffDto, UpdateStaffDto, StaffListDto } from './staff.dto.js';

export interface StaffDetail {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  employeeCode: string;
  driverLicenseNumber: string | null;
  serviceArea: string | null;
  status: string;
  active: boolean;
  createdAt: Date;
}

@Injectable()
export class StaffService {
  constructor(
    private readonly db: DataSource,

    @InjectRepository(StaffProfile)
    private readonly staffRepo: Repository<StaffProfile>,
  ) {}

  private normalizePhone(value: string) {
    return value.trim();
  }

  private normalizeCode(value: string) {
    return value.trim().toUpperCase();
  }

  private async getStaff(
    manager: EntityManager,
    id: string,
  ): Promise<StaffProfile> {
    const staff = await manager.findOneBy(StaffProfile, { id });

    if (!staff) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    return staff;
  }

  async list(query: StaffListDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));

    const qb = this.staffRepo
      .createQueryBuilder('staff')
      .innerJoin(User, 'u', 'u.id = staff.userId');

    if (query.search?.trim()) {
      qb.andWhere(
        `(
            u.fullName ILIKE :search
            OR u.phone ILIKE :search
            OR staff.employeeCode ILIKE :search
          )`,
        { search: `%${query.search.trim()}%` },
      );
    }

    const total = await qb.getCount();

    const data = await qb
      .select('staff.id', 'id')
      .addSelect('staff.userId', 'userId')
      .addSelect('u.fullName', 'fullName')
      .addSelect('u.phone', 'phone')
      .addSelect('staff.employeeCode', 'employeeCode')
      .addSelect('staff.driverLicenseNumber', 'driverLicenseNumber')
      .addSelect('staff.serviceArea', 'serviceArea')
      .addSelect('staff.status', 'status')
      .addSelect('staff.active', 'active')
      .addSelect('staff.createdAt', 'createdAt')
      .orderBy('staff.createdAt', 'DESC')
      .addOrderBy('staff.id', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany<StaffDetail>();

    return { data, total, page, limit };
  }

  async detail(id: string): Promise<StaffDetail> {
    const row = await this.staffRepo
      .createQueryBuilder('staff')
      .innerJoin(User, 'u', 'u.id = staff.userId')
      .select('staff.id', 'id')
      .addSelect('staff.userId', 'userId')
      .addSelect('u.fullName', 'fullName')
      .addSelect('u.phone', 'phone')
      .addSelect('staff.employeeCode', 'employeeCode')
      .addSelect('staff.driverLicenseNumber', 'driverLicenseNumber')
      .addSelect('staff.serviceArea', 'serviceArea')
      .addSelect('staff.status', 'status')
      .addSelect('staff.active', 'active')
      .addSelect('staff.createdAt', 'createdAt')
      .where('staff.id = :id', { id })
      .getRawOne<StaffDetail>();

    if (!row) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    return row;
  }

  async create(dto: CreateStaffDto) {
    const phone = this.normalizePhone(dto.phone);
    const code = this.normalizeCode(dto.employeeCode);
    const passwordHash = await hash(dto.password, 12);

    return this.db
      .transaction(async (manager) => {
        const existingUser = await manager.findOneBy(User, { phone });

        if (existingUser) {
          throw new ConflictException('Số điện thoại đã được sử dụng');
        }

        const existingStaff = await manager.findOneBy(StaffProfile, {
          employeeCode: code,
        });

        if (existingStaff) {
          throw new ConflictException('Mã nhân viên đã tồn tại');
        }

        const user = await manager.save(
          User,
          manager.create(User, {
            phone,
            fullName: dto.fullName.trim(),
            passwordHash,
            email: null,
            role: 'staff',
            status: 'active',
            lastLoginAt: null,
          }),
        );

        const staff = await manager.save(
          StaffProfile,
          manager.create(StaffProfile, {
            userId: user.id,
            employeeCode: code,
            phone,
            driverLicenseNumber: dto.driverLicenseNumber?.trim() || null,
            serviceArea: dto.serviceArea?.trim() || null,
            status: dto.status ?? 'available',
            active: true,
          }),
        );

        return {
          id: staff.id,
          userId: user.id,
          fullName: user.fullName,
          phone: user.phone,
          employeeCode: staff.employeeCode,
        };
      })
      .catch((error: unknown) => {
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          error.code === '23505'
        ) {
          throw new ConflictException(
            'Số điện thoại hoặc mã nhân viên đã tồn tại',
          );
        }
        throw error;
      });
  }

  async update(id: string, dto: UpdateStaffDto) {
    return this.db
      .transaction(async (manager) => {
        const staff = await this.getStaff(manager, id);
        const user = await manager.findOneBy(User, {
          id: staff.userId,
        });

        if (!user) {
          throw new NotFoundException('Không tìm thấy tài khoản nhân viên');
        }

        const phone = this.normalizePhone(dto.phone);
        const code = this.normalizeCode(dto.employeeCode);

        const duplicatePhone = await manager.findOneBy(User, { phone });

        if (duplicatePhone && duplicatePhone.id !== user.id) {
          throw new ConflictException('Số điện thoại đã được sử dụng');
        }

        const duplicateCode = await manager.findOneBy(StaffProfile, {
          employeeCode: code,
        });

        if (duplicateCode && duplicateCode.id !== staff.id) {
          throw new ConflictException('Mã nhân viên đã tồn tại');
        }

        user.fullName = dto.fullName.trim();
        user.phone = phone;

        staff.employeeCode = code;
        staff.phone = phone;
        staff.driverLicenseNumber = dto.driverLicenseNumber?.trim() || null;
        staff.serviceArea = dto.serviceArea?.trim() || null;
        staff.status = dto.status;

        await manager.save(User, user);
        await manager.save(StaffProfile, staff);

        return {
          success: true,
          id: staff.id,
        };
      })
      .catch((error: unknown) => {
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          error.code === '23505'
        ) {
          throw new ConflictException(
            'Số điện thoại hoặc mã nhân viên đã tồn tại',
          );
        }
        throw error;
      });
  }

  /**
   * Không cho ngừng hoạt động nếu nhân viên đang
   * được assign hoặc nếu rút nhân viên làm thiếu
   * năng lực phục vụ các booking đang giữ suất.
   */
  async changeStatus(id: string, active: boolean) {
    return this.db.transaction(async (manager) => {
      const staff = await this.getStaff(manager, id);

      if (staff.active === active) {
        return { success: true, active };
      }

      if (!active) {
        const assignments = await manager
          .getRepository(StaffAssignment)
          .createQueryBuilder('a')
          .innerJoin(Booking, 'b', 'b.id = a.bookingId')
          .where('a.staffId = :id', { id })
          .andWhere('a.status IN (:...statuses)', {
            statuses: ['assigned', 'accepted'],
          })
          .andWhere('b.status NOT IN (:...terminal)', {
            terminal: ['cancelled', 'completed', 'rejected'],
          })
          .getCount();

        if (assignments > 0) {
          throw new ConflictException(
            'Nhân viên đang phụ trách booking chưa hoàn tất',
          );
        }

        const availabilities = await manager.find(StaffSlotAvailability, {
          where: { staffId: id, active: true },
        });

        // Khóa các slot theo ID tăng dần để giảm nguy cơ deadlock.
        const slotIds = [
          ...new Set(availabilities.map((item) => item.slotId)),
        ].sort((a, b) => {
          const x = BigInt(a);
          const y = BigInt(b);
          return x < y ? -1 : x > y ? 1 : 0;
        });

        for (const slotId of slotIds) {
          const slot = await manager
            .getRepository(CenterTimeSlot)
            .createQueryBuilder('slot')
            .setLock('pessimistic_write')
            .where('slot.id = :slotId', { slotId })
            .getOne();

          if (!slot || slot.reservedCount === 0) continue;

          const total = await manager
            .getRepository(StaffSlotAvailability)
            .createQueryBuilder('a')
            .innerJoin(StaffProfile, 's', 's.id = a.staffId')
            .innerJoin(User, 'u', 'u.id = s.userId')
            .where('a.slotId = :slotId', { slotId })
            .andWhere('a.active = true')
            .andWhere('s.active = true')
            .andWhere("u.status = 'active'")
            .getCount();

          if (slot.reservedCount > Math.min(slot.capacity, total - 1)) {
            throw new ConflictException(
              'Không thể khóa nhân viên vì một số khung giờ đang có booking giữ suất',
            );
          }
        }
      }

      staff.active = active;
      if (!active) staff.status = 'unavailable';

      await manager.save(StaffProfile, staff);

      return { success: true, active };
    });
  }
}
