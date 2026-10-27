import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { Booking, Customer, Vehicle } from '../entities/inspection.entities.js';

import {
  CreateCustomerVehicleDto,
  UpdateCustomerVehicleDto,
} from './customer-vehicle.dto.js';

@Injectable()
export class CustomerVehicleService {
  constructor(private readonly db: DataSource) {}

  private normalizePlate(value: string): string {
    return value
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
  }

  private optional(value?: string): string | null {
    return value?.trim() || null;
  }

  private async getCustomer(
    manager: EntityManager,
    userId: string,
  ): Promise<Customer> {
    const customer = await manager.findOneBy(Customer, {
      userId,
    });

    if (!customer) {
      throw new NotFoundException(
        'Không tìm thấy hồ sơ khách hàng của tài khoản',
      );
    }

    return customer;
  }

  private async ownedVehicle(
    userId: string,
    vehicleId: string,
  ): Promise<Vehicle> {
    if (!/^\d+$/.test(vehicleId)) {
      throw new BadRequestException('ID phương tiện không hợp lệ');
    }

    const customer = await this.getCustomer(this.db.manager, userId);

    const vehicle = await this.db.getRepository(Vehicle).findOneBy({
      id: vehicleId,
      customerId: customer.id,
    });

    if (!vehicle) {
      throw new NotFoundException('Không tìm thấy phương tiện trong tài khoản');
    }

    return vehicle;
  }

  async list(userId: string): Promise<Vehicle[]> {
    const customer = await this.getCustomer(this.db.manager, userId);

    return this.db
      .getRepository(Vehicle)
      .createQueryBuilder('vehicle')
      .where('vehicle.customerId = :customerId', {
        customerId: customer.id,
      })
      .orderBy('vehicle.createdAt', 'DESC')
      .getMany();
  }

  async detail(userId: string, vehicleId: string): Promise<Vehicle> {
    return this.ownedVehicle(userId, vehicleId);
  }

  async create(
    userId: string,
    dto: CreateCustomerVehicleDto,
  ): Promise<Vehicle> {
    return this.db.transaction(async (manager) => {
      // Khóa Customer để tuần tự hóa các thao tác tạo xe
      // của cùng một tài khoản.
      const customer = await manager
        .getRepository(Customer)
        .createQueryBuilder('customer')
        .setLock('pessimistic_write')
        .where('customer.userId = :userId', { userId })
        .getOne();

      if (!customer) {
        throw new NotFoundException('Không tìm thấy hồ sơ khách hàng');
      }

      const plate = this.normalizePlate(dto.licensePlate);

      if (!plate) {
        throw new BadRequestException('Biển số xe không hợp lệ');
      }

      const vehicles = await manager.findBy(Vehicle, {
        customerId: customer.id,
      });

      if (
        vehicles.some(
          (vehicle) => this.normalizePlate(vehicle.licensePlate) === plate,
        )
      ) {
        throw new ConflictException('Phương tiện này đã có trong tài khoản');
      }

      const vehicle = manager.create(Vehicle, {
        customerId: customer.id,
        licensePlate: plate,
        vehicleType: dto.vehicleType,
        brand: this.optional(dto.brand),
        model: this.optional(dto.model),
        manufactureYear: dto.manufactureYear ?? null,
        chassisNumber: this.optional(dto.chassisNumber),
        engineNumber: this.optional(dto.engineNumber),
        seats: dto.seats ?? null,
        payloadKg: dto.payloadKg ?? null,
        inspectionExpiryDate: dto.inspectionExpiryDate || null,
        insuranceExpiryDate: dto.insuranceExpiryDate || null,
        note: this.optional(dto.note),
      });

      return manager.save(Vehicle, vehicle);
    });
  }

  async update(
    userId: string,
    vehicleId: string,
    dto: UpdateCustomerVehicleDto,
  ): Promise<Vehicle> {
    return this.db.transaction(async (manager) => {
      const customer = await manager
        .getRepository(Customer)
        .createQueryBuilder('customer')
        .setLock('pessimistic_write')
        .where('customer.userId = :userId', { userId })
        .getOne();

      if (!customer) {
        throw new NotFoundException('Không tìm thấy hồ sơ khách hàng');
      }

      const vehicle = await manager.findOneBy(Vehicle, {
        id: vehicleId,
        customerId: customer.id,
      });

      if (!vehicle) {
        throw new NotFoundException('Không tìm thấy phương tiện');
      }

      const plate = this.normalizePlate(dto.licensePlate);

      if (!plate) {
        throw new BadRequestException('Biển số xe không hợp lệ');
      }

      const vehicles = await manager.findBy(Vehicle, {
        customerId: customer.id,
      });

      const duplicate = vehicles.some(
        (item) =>
          item.id !== vehicle.id &&
          this.normalizePlate(item.licensePlate) === plate,
      );

      if (duplicate) {
        throw new ConflictException('Biển số xe đã được lưu trong tài khoản');
      }

      // Booking cũ lưu vehicle_snapshot nên việc cập nhật
      // hồ sơ xe sẽ không làm thay đổi thông tin lịch sử.
      vehicle.licensePlate = plate;
      vehicle.vehicleType = dto.vehicleType;
      vehicle.brand = this.optional(dto.brand);
      vehicle.model = this.optional(dto.model);
      vehicle.manufactureYear = dto.manufactureYear ?? null;
      vehicle.chassisNumber = this.optional(dto.chassisNumber);
      vehicle.engineNumber = this.optional(dto.engineNumber);
      vehicle.seats = dto.seats ?? null;
      vehicle.payloadKg = dto.payloadKg ?? null;
      vehicle.inspectionExpiryDate = dto.inspectionExpiryDate || null;
      vehicle.insuranceExpiryDate = dto.insuranceExpiryDate || null;
      vehicle.note = this.optional(dto.note);

      return manager.save(Vehicle, vehicle);
    });
  }

  async remove(
    userId: string,
    vehicleId: string,
  ): Promise<{ success: boolean }> {
    return this.db.transaction(async (manager) => {
      const customer = await manager
        .getRepository(Customer)
        .createQueryBuilder('customer')
        .setLock('pessimistic_write')
        .where('customer.userId = :userId', { userId })
        .getOne();

      if (!customer) {
        throw new NotFoundException('Không tìm thấy hồ sơ khách hàng');
      }

      const vehicle = await manager.findOneBy(Vehicle, {
        id: vehicleId,
        customerId: customer.id,
      });

      if (!vehicle) {
        throw new NotFoundException('Không tìm thấy phương tiện');
      }

      const usedCount = await manager.count(Booking, {
        where: { vehicleId: vehicle.id },
      });

      if (usedCount > 0) {
        throw new ConflictException(
          'Xe đã có booking liên kết nên không thể xóa. ' +
            'Để lưu trữ xe đã sử dụng, cần triển khai trạng thái ngừng sử dụng.',
        );
      }

      await manager.remove(Vehicle, vehicle);

      return { success: true };
    });
  }

  async bookingHistory(userId: string, vehicleId: string): Promise<Booking[]> {
    const vehicle = await this.ownedVehicle(userId, vehicleId);

    return this.db.getRepository(Booking).find({
      where: {
        customerId: vehicle.customerId,
        vehicleId: vehicle.id,
      },
      order: { createdAt: 'DESC' },
    });
  }
}
