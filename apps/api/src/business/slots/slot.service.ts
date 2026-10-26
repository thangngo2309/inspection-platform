import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import {
  CenterTimeSlot,
  InspectionCenter,
  StaffAssignment,
} from '../entities/inspection.entities.js';
import { StaffSlotAvailability } from '../entities/staff-slot-availability.entity.js';

import { AdminSlotListDto, CreateSlotDto, UpdateSlotDto } from './slot.dto.js';

@Injectable()
export class SlotService {
  constructor(private readonly db: DataSource) {}

  private normalizeTime(value: string): string {
    return `${value.slice(0, 5)}:00`;
  }

  private validateTime(start: string, end: string) {
    if (start >= end) {
      throw new BadRequestException('Giờ kết thúc phải lớn hơn giờ bắt đầu');
    }
  }

  private validateDate(value: string) {
    const d = new Date(`${value}T00:00:00+07:00`);

    if (
      Number.isNaN(d.getTime()) ||
      new Date(d.getTime() + 7 * 3600_000).toISOString().slice(0, 10) !== value
    ) {
      throw new BadRequestException('Ngày không hợp lệ');
    }
  }

  private validateFuture(date: string, time: string) {
    const start = new Date(`${date}T${time}+07:00`);

    if (start.getTime() <= Date.now()) {
      throw new BadRequestException(
        'Không được tạo hoặc sửa khung giờ đã bắt đầu',
      );
    }
  }

  private async getSlot(manager: EntityManager, id: string, lock = false) {
    const qb = manager
      .getRepository(CenterTimeSlot)
      .createQueryBuilder('slot')
      .where('slot.id = :id', { id });

    if (lock) qb.setLock('pessimistic_write');

    const slot = await qb.getOne();

    if (!slot) {
      throw new NotFoundException('Không tìm thấy khung giờ');
    }

    return slot;
  }

  /**
   * Khóa trung tâm để tuần tự hóa thao tác tạo slot.
   * Tất cả các endpoint tạo slot phải tuân thủ khóa này.
   */
  private async lockCenter(manager: EntityManager, id: string) {
    const center = await manager
      .getRepository(InspectionCenter)
      .createQueryBuilder('center')
      .setLock('pessimistic_write')
      .where('center.id = :id', { id })
      .getOne();

    if (!center) {
      throw new NotFoundException('Trung tâm không tồn tại');
    }

    return center;
  }

  private async ensureNoOverlap(
    manager: EntityManager,
    params: {
      centerId: string;
      slotDate: string;
      vehicleType: string;
      startTime: string;
      endTime: string;
      excludeId?: string;
    },
  ) {
    const qb = manager
      .getRepository(CenterTimeSlot)
      .createQueryBuilder('slot')
      .where('slot.centerId = :centerId', {
        centerId: params.centerId,
      })
      .andWhere('slot.slotDate = :date', {
        date: params.slotDate,
      })
      .andWhere('slot.vehicleType = :vehicleType', {
        vehicleType: params.vehicleType,
      })
      .andWhere('slot.startTime < :endTime', {
        endTime: params.endTime,
      })
      .andWhere('slot.endTime > :startTime', {
        startTime: params.startTime,
      });

    if (params.excludeId) {
      qb.andWhere('slot.id <> :excludeId', {
        excludeId: params.excludeId,
      });
    }

    if (await qb.getOne()) {
      throw new ConflictException(
        'Đã có khung giờ bị trùng trong cùng ngày, trung tâm và loại xe',
      );
    }
  }

  async list(query: AdminSlotListDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));

    const qb = this.db
      .getRepository(CenterTimeSlot)
      .createQueryBuilder('slot')
      .innerJoin(InspectionCenter, 'center', 'center.id = slot.centerId');

    if (query.centerId) {
      qb.andWhere('slot.centerId = :centerId', {
        centerId: query.centerId,
      });
    }

    if (query.date) {
      qb.andWhere('slot.slotDate = :date', { date: query.date });
    }

    if (query.vehicleType) {
      qb.andWhere('slot.vehicleType = :vehicleType', {
        vehicleType: query.vehicleType,
      });
    }

    const total = await qb.getCount();

    const rows = await qb
      .select('slot.id', 'id')
      .addSelect('slot.centerId', 'centerId')
      .addSelect('center.name', 'centerName')
      .addSelect('slot.slotDate', 'slotDate')
      .addSelect('slot.startTime', 'startTime')
      .addSelect('slot.endTime', 'endTime')
      .addSelect('slot.vehicleType', 'vehicleType')
      .addSelect('slot.capacity', 'capacity')
      .addSelect('slot.reservedCount', 'reservedCount')
      .addSelect('slot.status', 'status')
      .orderBy('slot.slotDate', 'ASC')
      .addOrderBy('slot.startTime', 'ASC')
      .addOrderBy('slot.id', 'ASC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany<{
        id: string;
        centerId: string;
        centerName: string;
        slotDate: string;
        startTime: string;
        endTime: string;
        vehicleType: string;
        capacity: number;
        reservedCount: number;
        status: string;
      }>();

    return {
      data: rows.map((row) => ({
        ...row,
        capacity: Number(row.capacity),
        reservedCount: Number(row.reservedCount),
      })),
      total,
      page,
      limit,
    };
  }

  async create(dto: CreateSlotDto) {
    const startTime = this.normalizeTime(dto.startTime);
    const endTime = this.normalizeTime(dto.endTime);

    this.validateDate(dto.slotDate);
    this.validateTime(startTime, endTime);
    this.validateFuture(dto.slotDate, startTime);

    return this.db.transaction(async (manager) => {
      const center = await this.lockCenter(manager, dto.centerId);

      if (center.status !== 'active') {
        throw new ConflictException('Trung tâm đang ngừng hoạt động');
      }

      await this.ensureNoOverlap(manager, {
        centerId: dto.centerId,
        slotDate: dto.slotDate,
        vehicleType: dto.vehicleType,
        startTime,
        endTime,
      });

      return manager.save(
        CenterTimeSlot,
        manager.create(CenterTimeSlot, {
          centerId: dto.centerId,
          scheduleId: null,
          slotDate: dto.slotDate,
          startTime,
          endTime,
          vehicleType: dto.vehicleType,
          capacity: dto.capacity,
          reservedCount: 0,
          status: 'open',
        }),
      );
    });
  }

  async update(id: string, dto: UpdateSlotDto) {
    const startTime = this.normalizeTime(dto.startTime);
    const endTime = this.normalizeTime(dto.endTime);

    this.validateTime(startTime, endTime);

    return this.db.transaction(async (manager) => {
      const existing = await manager.findOneBy(CenterTimeSlot, {
        id,
      });

      if (!existing) {
        throw new NotFoundException('Không tìm thấy khung giờ');
      }

      // Giữ cùng thứ tự khóa với create: center trước.
      await this.lockCenter(manager, existing.centerId);
      const slot = await this.getSlot(manager, id, true);

      this.validateFuture(slot.slotDate, slot.startTime);

      if (dto.capacity < slot.reservedCount) {
        throw new ConflictException(
          'Hạn mức không được nhỏ hơn số booking đã đặt',
        );
      }

      const hasScheduleChange =
        slot.startTime.slice(0, 5) !== dto.startTime ||
        slot.endTime.slice(0, 5) !== dto.endTime;

      if (hasScheduleChange) {
        const availabilityCount = await manager.count(StaffSlotAvailability, {
          where: { slotId: id, active: true },
        });

        const assignmentCount = await manager.count(StaffAssignment, {
          where: { slotId: id },
        });

        if (
          slot.reservedCount > 0 ||
          availabilityCount > 0 ||
          assignmentCount > 0
        ) {
          throw new ConflictException(
            'Không thể đổi giờ khi đã có booking hoặc nhân viên được bố trí',
          );
        }
      }

      await this.ensureNoOverlap(manager, {
        centerId: slot.centerId,
        slotDate: slot.slotDate,
        vehicleType: slot.vehicleType,
        startTime,
        endTime,
        excludeId: id,
      });

      slot.startTime = startTime;
      slot.endTime = endTime;
      slot.capacity = dto.capacity;

      return manager.save(CenterTimeSlot, slot);
    });
  }

  async changeStatus(id: string, status: 'open' | 'closed') {
    return this.db.transaction(async (manager) => {
      const existing = await manager.findOneBy(CenterTimeSlot, {
        id,
      });

      if (!existing) {
        throw new NotFoundException('Không tìm thấy khung giờ');
      }

      await this.lockCenter(manager, existing.centerId);
      const slot = await this.getSlot(manager, id, true);

      if (status === 'open') {
        this.validateFuture(slot.slotDate, slot.startTime);
        const center = await manager.findOneBy(InspectionCenter, {
          id: slot.centerId,
        });

        if (!center || center.status !== 'active') {
          throw new ConflictException('Trung tâm chưa hoạt động');
        }
      }

      // Đóng slot chỉ ngừng nhận booking mới.
      // Booking hiện có không bị hủy tự động.
      slot.status = status;

      return manager.save(CenterTimeSlot, slot);
    });
  }
}
