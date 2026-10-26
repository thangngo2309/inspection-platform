import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DataSource, EntityManager, In } from 'typeorm';

import { randomUUID } from 'node:crypto';

import {
  Booking,
  BookingStatusHistory,
  CenterClosure,
  CenterTimeSlot,
  Customer,
  InspectionCenter,
  Service,
  StaffAssignment,
  StaffProfile,
  User,
  Vehicle,
} from '../entities/inspection.entities.js';

import { StaffSlotAvailability } from '../entities/staff-slot-availability.entity.js';

import {
  AssignBookingDto,
  ConfigureSlotStaffDto,
  CreateBookingDto,
  ListBookingsDto,
  SlotQueryDto,
} from './booking.dto.js';

// ======================================================
// TYPES
// ======================================================

const ACTIVE_ASSIGNMENT_STATUSES = ['assigned', 'accepted'];

const BLOCKED_BOOKING_STATUSES = ['cancelled', 'completed', 'rejected'];

interface AdminSlotQuery {
  centerId?: string;
  date?: string;
}

export interface BookingSlotResponse {
  id: string;
  centerId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  remaining: number;
}

export interface AdminStaffRow {
  id: string;
  employeeCode: string;
  fullName: string;
  phone: string;
}

export interface SlotStaffRow {
  id: string;
  employeeCode: string;
  fullName: string;
  assignedBookingId: string | null;
}

// ======================================================
// SERVICE
// ======================================================

@Injectable()
export class BookingService {
  constructor(private readonly db: DataSource) {}

  // ====================================================
  // PRIVATE HELPERS
  // ====================================================

  private normalizePlate(value: string): string {
    return value
      .trim()
      .toUpperCase()
      .replace(/[\s.-]/g, '');
  }

  private normalizePhone(value: string): string {
    return value.trim().replace(/[\s.-]/g, '');
  }

  private toNumber(value: number | string): number {
    return Number(value);
  }

  /**
   * Khóa dòng slot trong PostgreSQL.
   *
   * Những thao tác thay đổi capacity hoặc assignment
   * phải gọi helper này bên trong transaction.
   */
  private async lockSlot(
    manager: EntityManager,
    slotId: string,
  ): Promise<CenterTimeSlot> {
    const slot = await manager
      .getRepository(CenterTimeSlot)
      .createQueryBuilder('slot')
      .setLock('pessimistic_write')
      .where('slot.id = :slotId', { slotId })
      .getOne();

    if (!slot) {
      throw new NotFoundException('Không tìm thấy khung giờ đăng kiểm');
    }

    return slot;
  }

  /**
   * Khóa hồ sơ nhân viên trước khi cấu hình lịch.
   *
   * Giúp hai request bố trí cùng một nhân viên
   * vào các slot khác nhau được xử lý tuần tự.
   */
  private async lockStaff(
    manager: EntityManager,
    staffId: string,
  ): Promise<StaffProfile> {
    const staff = await manager
      .getRepository(StaffProfile)
      .createQueryBuilder('staff')
      .setLock('pessimistic_write')
      .where('staff.id = :staffId', { staffId })
      .getOne();

    if (!staff || !staff.active) {
      throw new NotFoundException(
        'Nhân viên không tồn tại hoặc đã ngừng hoạt động',
      );
    }

    const user = await manager.findOneBy(User, {
      id: staff.userId,
    });

    if (!user || user.status !== 'active') {
      throw new ConflictException('Tài khoản nhân viên không còn hoạt động');
    }

    return staff;
  }

  /**
   * Số lượng nhân viên đã đăng ký khả dụng cho slot.
   *
   * Chỉ tính các nhân viên:
   * - Có bản ghi availability active
   * - Hồ sơ nhân viên active
   * - Tài khoản user active
   */
  private async staffCount(
    manager: EntityManager,
    slotId: string,
  ): Promise<number> {
    return manager
      .getRepository(StaffSlotAvailability)
      .createQueryBuilder('availability')
      .innerJoin(StaffProfile, 'staff', 'staff.id = availability.staffId')
      .innerJoin(User, 'user', 'user.id = staff.userId')
      .where('availability.slotId = :slotId', {
        slotId,
      })
      .andWhere('availability.active = true')
      .andWhere('staff.active = true')
      .andWhere('user.status = :status', {
        status: 'active',
      })
      .getCount();
  }

  /**
   * Sức chứa thực tế:
   *
   * min(
   *   số suất trung tâm,
   *   số nhân viên khả dụng
   * )
   */
  private async effectiveCapacity(
    manager: EntityManager,
    slot: CenterTimeSlot,
  ): Promise<number> {
    const staffCapacity = await this.staffCount(manager, slot.id);

    return Math.min(slot.capacity, staffCapacity);
  }

  private getRemaining(slot: CenterTimeSlot, capacity: number): number {
    return Math.max(0, capacity - slot.reservedCount);
  }

  /**
   * Chuyển ngày giờ của slot sang thời điểm UTC.
   *
   * Hiện hệ thống triển khai tại Việt Nam,
   * timezone nghiệp vụ là Asia/Ho_Chi_Minh (UTC+7).
   */
  private slotStartAt(slot: CenterTimeSlot): Date {
    const dateValue = String(slot.slotDate).slice(0, 10);
    const timeValue = String(slot.startTime);

    const date = new Date(`${dateValue}T${timeValue}+07:00`);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(
        'Ngày giờ của khung đăng kiểm không hợp lệ',
      );
    }

    return date;
  }

  private validateFutureSlot(slot: CenterTimeSlot): void {
    const start = this.slotStartAt(slot);

    if (start.getTime() <= Date.now()) {
      throw new ConflictException('Khung giờ đã bắt đầu hoặc đã hết hạn');
    }
  }

  private async ensureCenterOpen(
    manager: EntityManager,
    centerId: string,
    slotDate: string,
  ): Promise<void> {
    const closure = await manager.findOneBy(CenterClosure, {
      centerId,
      closedDate: slotDate,
    });

    if (closure) {
      throw new ConflictException(
        'Trung tâm đăng kiểm không tiếp nhận xe trong ngày này',
      );
    }
  }

  /**
   * Kiểm tra nhân viên đã được bố trí vào
   * một khung giờ giao nhau hay chưa.
   *
   * Khoảng [start, end) dùng để xác định overlap.
   */
  private async ensureNoStaffOverlap(
    manager: EntityManager,
    staffId: string,
    slot: CenterTimeSlot,
  ): Promise<void> {
    const overlapping = await manager
      .getRepository(StaffSlotAvailability)
      .createQueryBuilder('availability')
      .innerJoin(
        CenterTimeSlot,
        'otherSlot',
        'otherSlot.id = availability.slotId',
      )
      .where('availability.staffId = :staffId', {
        staffId,
      })
      .andWhere('availability.active = true')
      .andWhere('availability.slotId <> :slotId', {
        slotId: slot.id,
      })
      .andWhere('otherSlot.slotDate = :date', {
        date: slot.slotDate,
      })
      .andWhere('otherSlot.startTime < :endTime', {
        endTime: slot.endTime,
      })
      .andWhere('otherSlot.endTime > :startTime', {
        startTime: slot.startTime,
      })
      .getOne();

    if (overlapping) {
      throw new ConflictException(
        'Nhân viên đã được bố trí ở khung giờ trùng thời gian',
      );
    }
  }

  /**
   * Kiểm tra việc nhân viên đã được phân công
   * cho booking khác cùng slot hay chưa.
   */
  private async ensureStaffNotAssigned(
    manager: EntityManager,
    staffId: string,
    slotId: string,
  ): Promise<void> {
    const existed = await manager
      .getRepository(StaffAssignment)
      .createQueryBuilder('assignment')
      .where('assignment.staffId = :staffId', {
        staffId,
      })
      .andWhere('assignment.slotId = :slotId', {
        slotId,
      })
      .andWhere('assignment.status IN (:...statuses)', {
        statuses: ACTIVE_ASSIGNMENT_STATUSES,
      })
      .getOne();

    if (existed) {
      throw new ConflictException(
        'Nhân viên đã được phân công cho booking khác',
      );
    }
  }

  /**
   * Dùng dữ liệu khách hàng đã đăng nhập.
   */
  private async getCustomer(
    manager: EntityManager,
    userId: string,
  ): Promise<Customer> {
    const user = await manager.findOneBy(User, {
      id: userId,
    });

    if (!user || user.status !== 'active' || user.role !== 'customer') {
      throw new ForbiddenException('Tài khoản không được phép tạo booking');
    }

    // Khóa customer để các yêu cầu đồng thời của cùng
    // khách không tạo trùng hồ sơ xe ngoài ý muốn.
    const customer = await manager
      .getRepository(Customer)
      .createQueryBuilder('customer')
      .setLock('pessimistic_write')
      .where('customer.userId = :userId', {
        userId,
      })
      .getOne();

    if (!customer) {
      throw new NotFoundException('Không tìm thấy hồ sơ khách hàng');
    }

    return customer;
  }

  // ====================================================
  // PUBLIC BOOKING OPTIONS
  // ====================================================

  /**
   * Danh sách trung tâm đang hoạt động.
   */
  async centers(): Promise<InspectionCenter[]> {
    return this.db.getRepository(InspectionCenter).find({
      where: {
        status: 'active',
      },
      order: {
        name: 'ASC',
      },
    });
  }

  /**
   * Danh sách dịch vụ có thể lựa chọn.
   */
  async services(): Promise<Service[]> {
    return this.db.getRepository(Service).find({
      where: {
        active: true,
      },
      order: {
        name: 'ASC',
      },
    });
  }

  /**
   * Danh sách slot còn chỗ.
   *
   * Slot chỉ được hiển thị khi:
   * - Trung tâm hoạt động
   * - Slot open
   * - Chưa tới giờ bắt đầu
   * - Không thuộc ngày nghỉ
   * - Còn đủ nhân viên
   */
  async slots(query: SlotQueryDto): Promise<BookingSlotResponse[]> {
    const center = await this.db.getRepository(InspectionCenter).findOneBy({
      id: query.centerId,
      status: 'active',
    });

    if (!center) {
      return [];
    }

    const slots = await this.db.getRepository(CenterTimeSlot).find({
      where: {
        centerId: query.centerId,
        slotDate: query.date,
        vehicleType: query.vehicleType,
        status: 'open',
      },
      order: {
        startTime: 'ASC',
      },
    });

    if (slots.length === 0) {
      return [];
    }

    const closure = await this.db.getRepository(CenterClosure).findOneBy({
      centerId: query.centerId,
      closedDate: query.date,
    });

    if (closure) {
      return [];
    }

    const result = await Promise.all(
      slots.map(async (slot) => {
        const capacity = await this.effectiveCapacity(this.db.manager, slot);

        return {
          id: slot.id,
          centerId: slot.centerId,
          date: slot.slotDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          capacity,
          booked: slot.reservedCount,
          remaining: this.getRemaining(slot, capacity),
          isFuture: this.slotStartAt(slot).getTime() > Date.now(),
        };
      }),
    );

    return result
      .filter((slot) => slot.isFuture && slot.remaining > 0)
      .map(({ isFuture: _isFuture, ...slot }) => {
        void _isFuture;
        return slot;
      });
  }

  // ====================================================
  // CUSTOMER CREATE BOOKING
  // ====================================================

  async create(dto: CreateBookingDto) {
    return this.db.transaction(async (manager: EntityManager) => {
      // 1. Khóa slot để chống đặt vượt số suất
      const slot = await this.lockSlot(manager, dto.slotId);

      if (slot.status !== 'open') {
        throw new ConflictException('Khung giờ đã đóng nhận booking');
      }

      if (
        slot.centerId !== dto.centerId ||
        slot.vehicleType !== dto.vehicleType
      ) {
        throw new BadRequestException(
          'Khung giờ không phù hợp với trung tâm hoặc loại xe',
        );
      }

      this.validateFutureSlot(slot);

      // 2. Kiểm tra trung tâm
      const center = await manager.findOneBy(InspectionCenter, {
        id: dto.centerId,
        status: 'active',
      });

      if (!center) {
        throw new NotFoundException('Trung tâm không hoạt động');
      }

      await this.ensureCenterOpen(manager, center.id, slot.slotDate);

      // 3. Kiểm tra dịch vụ
      const service = await manager.findOneBy(Service, {
        id: dto.serviceId,
        active: true,
      });

      if (!service) {
        throw new NotFoundException('Dịch vụ không hợp lệ');
      }

      // 4. Kiểm tra năng lực nhân viên
      const capacity = await this.effectiveCapacity(manager, slot);

      if (slot.reservedCount >= capacity) {
        throw new ConflictException(
          'Khung giờ đã hết suất đăng kiểm hoặc nhân viên phụ trách',
        );
      }

      // 5. Chuẩn hóa thông tin liên hệ
      const customerName = dto.customerName.trim();
      const customerPhone = this.normalizePhone(dto.customerPhone);

      if (!customerName) {
        throw new BadRequestException('Vui lòng nhập tên người liên hệ');
      }

      if (!/^0\d{9}$/.test(customerPhone)) {
        throw new BadRequestException('Số điện thoại liên hệ không hợp lệ');
      }

      if (dto.pickupRequired && !dto.pickupAddress?.trim()) {
        throw new BadRequestException('Vui lòng nhập địa chỉ nhận xe');
      }

      // 6. Chuẩn hóa thông tin xe
      const licensePlate = this.normalizePlate(dto.licensePlate);

      if (!licensePlate) {
        throw new BadRequestException('Biển số xe không hợp lệ');
      }

      const vehicleSnapshot = {
        licensePlate,
        vehicleType: dto.vehicleType,
        brand: dto.brand?.trim() || null,
        model: dto.model?.trim() || null,
        manufactureYear: dto.manufactureYear ?? null,
        chassisNumber: dto.chassisNumber?.trim() || null,
        engineNumber: dto.engineNumber?.trim() || null,
        seats: dto.seats ?? null,
        payloadKg: dto.payloadKg || null,
        inspectionExpiryDate: dto.inspectionExpiryDate || null,
        insuranceExpiryDate: dto.insuranceExpiryDate || null,
      };

      // 7. Giá dịch vụ do Backend xác định
      const serviceFee = Number(service.basePrice);

      if (!Number.isFinite(serviceFee) || serviceFee < 0) {
        throw new BadRequestException('Giá dịch vụ không hợp lệ');
      }

      const fee = serviceFee.toFixed(2);

      const bookingCode = `DK-${randomUUID()
        .replace(/-/g, '')
        .slice(0, 16)
        .toUpperCase()}`;

      // 8. Tạo booking không cần User
      const bookingEntity = manager.create(Booking, {
        bookingCode,

        customerId: null,
        vehicleId: null,

        centerId: center.id,
        slotId: slot.id,
        serviceId: service.id,

        status: 'pending_confirmation',

        customerName,
        customerPhone,
        customerEmail: dto.customerEmail?.trim().toLowerCase() || null,

        licensePlate,
        vehicleSnapshot,
        serviceName: service.name,

        serviceFee: fee,
        inspectionFee: '0.00',
        insuranceFee: '0.00',
        discountAmount: '0.00',
        totalAmount: fee,

        pickupRequired: dto.pickupRequired,
        pickupAddress: dto.pickupRequired
          ? dto.pickupAddress?.trim() || null
          : null,

        pickupLatitude: null,
        pickupLongitude: null,

        returnAddress: dto.returnAddress?.trim() || null,

        customerNote: dto.customerNote?.trim() || null,

        internalNote: null,

        phoneVerifiedAt: null,
        confirmedAt: null,
        cancelledAt: null,
        cancellationReason: null,
        completedAt: null,
      });

      const booking = await manager.save(Booking, bookingEntity);

      // 9. Giữ suất ngay trong transaction
      slot.reservedCount += 1;

      await manager.save(CenterTimeSlot, slot);

      // 10. Ghi lịch sử Guest Booking
      await manager.save(
        BookingStatusHistory,
        manager.create(BookingStatusHistory, {
          bookingId: booking.id,
          fromStatus: null,
          toStatus: 'pending_confirmation',
          actorUserId: null,
          note: 'Khách hàng tạo booking không cần đăng nhập',
        }),
      );

      return {
        id: booking.id,
        bookingCode: booking.bookingCode,
        status: booking.status,
        totalAmount: booking.totalAmount,
      };
    });
  }

  // ====================================================
  // CUSTOMER MY BOOKINGS
  // ====================================================

  async myBookings(userId: string): Promise<Booking[]> {
    const customer = await this.db.getRepository(Customer).findOneBy({
      userId,
    });

    if (!customer) {
      return [];
    }

    return this.db.getRepository(Booking).find({
      where: {
        customerId: customer.id,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // ====================================================
  // ADMIN BOOKING LIST
  // ====================================================

  async adminList(query: ListBookingsDto) {
    const page = Math.max(1, Number(query.page) || 1);

    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    const qb = this.db
      .getRepository(Booking)
      .createQueryBuilder('booking')

      .leftJoin(CenterTimeSlot, 'slot', 'slot.id = booking.slotId')

      .leftJoin(InspectionCenter, 'center', 'center.id = booking.centerId')

      .leftJoin(
        StaffAssignment,
        'assignment',
        `
            assignment.bookingId = booking.id
            AND assignment.status
              IN (:...activeStatuses)
          `,
        {
          activeStatuses: ACTIVE_ASSIGNMENT_STATUSES,
        },
      )

      .leftJoin(StaffProfile, 'staff', 'staff.id = assignment.staffId')

      .leftJoin(User, 'staffUser', 'staffUser.id = staff.userId');

    if (query.status) {
      qb.andWhere('booking.status = :status', {
        status: query.status,
      });
    }

    if (query.search?.trim()) {
      qb.andWhere(
        `
            (
              booking.bookingCode ILIKE :search
              OR booking.customerName ILIKE :search
              OR booking.customerPhone ILIKE :search
              OR booking.licensePlate ILIKE :search
            )
          `,
        {
          search: `%${query.search.trim()}%`,
        },
      );
    }

    const total = await qb.getCount();

    const data = await qb
      .select('booking.id', 'id')
      .addSelect('booking.bookingCode', 'code')
      .addSelect('booking.customerName', 'customer')
      .addSelect('booking.customerPhone', 'phone')
      .addSelect('booking.licensePlate', 'plate')
      .addSelect('booking.status', 'status')
      .addSelect('booking.slotId', 'slotId')
      .addSelect('booking.centerId', 'centerId')
      .addSelect('booking.totalAmount', 'totalAmount')
      .addSelect('slot.slotDate', 'slotDate')
      .addSelect('slot.startTime', 'startTime')
      .addSelect('center.name', 'centerName')
      .addSelect('staff.id', 'staffId')
      .addSelect('staffUser.fullName', 'staffName')
      .orderBy('booking.createdAt', 'DESC')
      .addOrderBy('booking.id', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  // ====================================================
  // ADMIN STAFF LIST
  // ====================================================

  async staff(): Promise<AdminStaffRow[]> {
    return this.db
      .getRepository(StaffProfile)
      .createQueryBuilder('staff')

      .innerJoin(User, 'user', 'user.id = staff.userId')

      .select('staff.id', 'id')
      .addSelect('staff.employeeCode', 'employeeCode')
      .addSelect('user.fullName', 'fullName')
      .addSelect('user.phone', 'phone')

      .where('staff.active = true')
      .andWhere('user.status = :status', {
        status: 'active',
      })

      .orderBy('user.fullName', 'ASC')

      .getRawMany<AdminStaffRow>();
  }

  // ====================================================
  // ADMIN SLOT STAFF LIST
  // ====================================================

  async slotStaff(slotId: string): Promise<SlotStaffRow[]> {
    const slot = await this.db
      .getRepository(CenterTimeSlot)
      .findOneBy({ id: slotId });

    if (!slot) {
      throw new NotFoundException('Không tìm thấy khung giờ');
    }

    return this.db
      .getRepository(StaffSlotAvailability)
      .createQueryBuilder('availability')

      .innerJoin(StaffProfile, 'staff', 'staff.id = availability.staffId')

      .innerJoin(User, 'user', 'user.id = staff.userId')

      .leftJoin(
        StaffAssignment,
        'assignment',
        `
        "assignment"."staff_id" = "staff"."id"
        AND "assignment"."slot_id" = "availability"."slot_id"
        AND "assignment"."status" IN (:...statuses)
      `,
        {
          statuses: ACTIVE_ASSIGNMENT_STATUSES,
        },
      )

      .select('staff.id', 'id')
      .addSelect('staff.employeeCode', 'employeeCode')
      .addSelect('user.fullName', 'fullName')
      .addSelect('assignment.bookingId', 'assignedBookingId')

      .where('availability.slotId = :slotId', {
        slotId,
      })

      .andWhere('availability.active = true')
      .andWhere('staff.active = true')
      .andWhere('user.status = :status', {
        status: 'active',
      })

      .orderBy('user.fullName', 'ASC')

      .getRawMany<SlotStaffRow>();
  }

  // ====================================================
  // ADMIN CONFIGURE STAFF FOR SLOT
  // ====================================================

  async configureStaff(slotId: string, dto: ConfigureSlotStaffDto) {
    return this.db.transaction(async (manager: EntityManager) => {
      // Khóa hồ sơ nhân viên trước để ngăn
      // việc bố trí trùng giờ đồng thời.
      await this.lockStaff(manager, dto.staffId);

      const slot = await this.lockSlot(manager, slotId);

      this.validateFutureSlot(slot);

      if (slot.status !== 'open') {
        throw new ConflictException('Khung giờ không còn mở');
      }

      await this.ensureStaffNoOverlapForSlot(manager, dto.staffId, slot);

      let availability = await manager.findOneBy(StaffSlotAvailability, {
        slotId,
        staffId: dto.staffId,
      });

      if (availability) {
        if (availability.active) {
          return availability;
        }

        availability.active = true;
      } else {
        availability = manager.create(StaffSlotAvailability, {
          slotId,
          staffId: dto.staffId,
          active: true,
        });
      }

      return manager.save(StaffSlotAvailability, availability);
    });
  }

  /**
   * Wrapper cho việc kiểm tra chồng giờ.
   * Đặt riêng để dùng lại trong configureStaff.
   */
  private async ensureStaffNoOverlapForSlot(
    manager: EntityManager,
    staffId: string,
    slot: CenterTimeSlot,
  ): Promise<void> {
    await this.ensureNoStaffOverlap(manager, staffId, slot);
  }

  // ====================================================
  // ADMIN REMOVE STAFF FROM SLOT
  // ====================================================

  async removeStaff(slotId: string, staffId: string) {
    return this.db.transaction(async (manager: EntityManager) => {
      // Cùng thứ tự khóa với configureStaff:
      // staff trước, slot sau.
      await this.lockStaff(manager, staffId);

      const slot = await this.lockSlot(manager, slotId);

      const availability = await manager.findOneBy(StaffSlotAvailability, {
        slotId,
        staffId,
        active: true,
      });

      if (!availability) {
        throw new NotFoundException('Nhân viên không thuộc khung giờ');
      }

      // ----------------------------------------------
      // CHECK ACTIVE ASSIGNMENT
      // ----------------------------------------------

      const assignment = await manager.findOne(StaffAssignment, {
        where: {
          slotId,
          staffId,
          status: In(ACTIVE_ASSIGNMENT_STATUSES),
        },
      });

      if (assignment) {
        throw new ConflictException('Không thể bỏ nhân viên đã được phân công');
      }

      // ----------------------------------------------
      // CHECK CAPACITY AFTER REMOVAL
      // ----------------------------------------------

      const currentCapacity = await this.staffCount(manager, slotId);

      const afterRemoval = Math.max(0, currentCapacity - 1);

      const effectiveAfterRemoval = Math.min(slot.capacity, afterRemoval);

      if (slot.reservedCount > effectiveAfterRemoval) {
        throw new ConflictException(
          'Không thể bỏ nhân viên vì khung giờ đã có booking giữ suất',
        );
      }

      // ----------------------------------------------
      // UPDATE
      // ----------------------------------------------

      availability.active = false;

      await manager.save(StaffSlotAvailability, availability);

      return {
        success: true,
        slotId,
        staffId,
      };
    });
  }

  // ====================================================
  // ADMIN ASSIGN BOOKING
  // ====================================================

  async assign(bookingId: string, dto: AssignBookingDto, actorUserId: string) {
    return this.db.transaction(async (manager: EntityManager) => {
      // ----------------------------------------------
      // 1. FIND BOOKING
      // ----------------------------------------------

      const booking = await manager.findOneBy(Booking, {
        id: bookingId,
      });

      if (!booking) {
        throw new NotFoundException('Booking không tồn tại');
      }

      // ----------------------------------------------
      // 2. LOCK SLOT
      // ----------------------------------------------

      const slot = await this.lockSlot(manager, booking.slotId);

      // ----------------------------------------------
      // 3. CHECK BOOKING STATUS
      // ----------------------------------------------

      if (BLOCKED_BOOKING_STATUSES.includes(booking.status)) {
        throw new ConflictException('Booking không còn được phép phân công');
      }

      // ----------------------------------------------
      // 4. CHECK EXISTING ASSIGNMENT
      // ----------------------------------------------

      const bookingAssignment = await manager.findOne(StaffAssignment, {
        where: {
          bookingId,
          status: In(ACTIVE_ASSIGNMENT_STATUSES),
        },
      });

      if (bookingAssignment) {
        throw new ConflictException('Booking đã có nhân viên phụ trách');
      }

      // ----------------------------------------------
      // 5. CHECK STAFF
      // ----------------------------------------------

      const staff = await manager.findOneBy(StaffProfile, {
        id: dto.staffId,
        active: true,
      });

      if (!staff) {
        throw new NotFoundException(
          'Nhân viên không tồn tại hoặc không hoạt động',
        );
      }

      const staffUser = await manager.findOneBy(User, {
        id: staff.userId,
      });

      if (!staffUser || staffUser.status !== 'active') {
        throw new ConflictException('Tài khoản nhân viên không hoạt động');
      }

      // ----------------------------------------------
      // 6. CHECK SLOT AVAILABILITY
      // ----------------------------------------------

      const availability = await manager.findOneBy(StaffSlotAvailability, {
        slotId: slot.id,
        staffId: staff.id,
        active: true,
      });

      if (!availability) {
        throw new ConflictException(
          'Nhân viên không được bố trí vào khung giờ này',
        );
      }

      // ----------------------------------------------
      // 7. CHECK STAFF CONFLICT
      // ----------------------------------------------

      await this.ensureStaffNotAssigned(manager, staff.id, slot.id);

      // ----------------------------------------------
      // 8. CREATE ASSIGNMENT
      // ----------------------------------------------

      const assignmentEntity = manager.create(StaffAssignment, {
        bookingId: booking.id,
        slotId: slot.id,
        staffId: staff.id,

        assignedByUserId: actorUserId,

        status: 'assigned',
        assignedAt: new Date(),

        acceptedAt: null,
        finishedAt: null,
        note: null,
      });

      const assignment = await manager.save(StaffAssignment, assignmentEntity);

      return {
        success: true,
        assignmentId: assignment.id,
        bookingId: booking.id,
        staffId: staff.id,
        staffName: staffUser.fullName,
      };
    });
  }

  // ====================================================
  // ADMIN SLOT LIST
  // ====================================================

  async adminSlots(params: AdminSlotQuery) {
    const qb = this.db
      .getRepository(CenterTimeSlot)
      .createQueryBuilder('slot')

      .innerJoin(InspectionCenter, 'center', 'center.id = slot.centerId')

      .select('slot.id', 'id')
      .addSelect('slot.centerId', 'centerId')
      .addSelect('center.name', 'centerName')
      .addSelect('slot.slotDate', 'slotDate')
      .addSelect('slot.startTime', 'startTime')
      .addSelect('slot.endTime', 'endTime')
      .addSelect('slot.vehicleType', 'vehicleType')
      .addSelect('slot.capacity', 'centerCapacity')
      .addSelect('slot.reservedCount', 'booked')
      .addSelect('slot.status', 'status');

    if (params.centerId) {
      qb.andWhere('slot.centerId = :centerId', {
        centerId: params.centerId,
      });
    }

    if (params.date) {
      qb.andWhere('slot.slotDate = :date', {
        date: params.date,
      });
    }

    const rows = await qb
      .orderBy('slot.slotDate', 'ASC')
      .addOrderBy('slot.startTime', 'ASC')
      .limit(300)
      .getRawMany<{
        id: string;
        centerId: string;
        centerName: string;
        slotDate: string;
        startTime: string;
        endTime: string;
        vehicleType: string;
        centerCapacity: number;
        booked: number;
        status: string;
      }>();

    return Promise.all(
      rows.map(async (row) => {
        const count = await this.staffCount(this.db.manager, row.id);

        const centerCapacity = Number(row.centerCapacity);

        const booked = Number(row.booked);

        const effectiveCapacity = Math.min(centerCapacity, count);

        return {
          ...row,
          centerCapacity,
          booked,

          staffCount: count,

          effectiveCapacity,

          remaining: Math.max(0, effectiveCapacity - booked),
        };
      }),
    );
  }
}
