import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { InspectionCenter, Service } from '../entities/inspection.entities.js';

import {
  CatalogListDto,
  CreateCenterDto,
  CreateServiceDto,
  UpdateCenterDto,
  UpdateServiceDto,
} from './catalog.dto.js';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,

    @InjectRepository(InspectionCenter)
    private readonly centerRepo: Repository<InspectionCenter>,
  ) {}

  private pagination(query: CatalogListDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    return { page, limit, skip: (page - 1) * limit };
  }

  private validatePrice(value: string): string {
    const price = Number(value);
    if (
      !Number.isFinite(price) ||
      price < 0 ||
      !/^\d+(\.\d{1,2})?$/.test(value)
    ) {
      throw new BadRequestException('Giá dịch vụ không hợp lệ');
    }
    return price.toFixed(2);
  }

  private validateCoordinate(
    value: string | undefined,
    min: number,
    max: number,
  ): string | null {
    if (!value?.trim()) return null;
    const number = Number(value);
    if (!Number.isFinite(number) || number < min || number > max) {
      throw new BadRequestException('Tọa độ không hợp lệ');
    }
    return value.trim();
  }

  async listServices(query: CatalogListDto) {
    const { page, limit, skip } = this.pagination(query);
    const search = query.search?.trim();

    const [data, total] = await this.serviceRepo.findAndCount({
      where: search
        ? [{ name: ILike(`%${search}%`) }, { code: ILike(`%${search}%`) }]
        : {},
      order: { createdAt: 'DESC', id: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async getService(id: string) {
    const item = await this.serviceRepo.findOneBy({ id });
    if (!item) throw new NotFoundException('Không tìm thấy dịch vụ');
    return item;
  }

  async createService(dto: CreateServiceDto) {
    const code = dto.code.trim().toUpperCase();

    const exists = await this.serviceRepo.findOneBy({ code });
    if (exists) throw new ConflictException('Mã dịch vụ đã tồn tại');

    return this.serviceRepo.save(
      this.serviceRepo.create({
        code,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        serviceType: dto.serviceType.trim(),
        basePrice: this.validatePrice(dto.basePrice),
        active: dto.active ?? true,
      }),
    );
  }

  async updateService(id: string, dto: UpdateServiceDto) {
    const item = await this.getService(id);
    const code = dto.code.trim().toUpperCase();

    const exists = await this.serviceRepo.findOneBy({ code });
    if (exists && exists.id !== id) {
      throw new ConflictException('Mã dịch vụ đã tồn tại');
    }

    item.code = code;
    item.name = dto.name.trim();
    item.description = dto.description?.trim() || null;
    item.serviceType = dto.serviceType.trim();
    item.basePrice = this.validatePrice(dto.basePrice);
    item.active = dto.active ?? item.active;

    return this.serviceRepo.save(item);
  }

  async setServiceStatus(id: string, active: boolean) {
    const item = await this.getService(id);
    item.active = active;
    return this.serviceRepo.save(item);
  }

  async listCenters(query: CatalogListDto) {
    const { page, limit, skip } = this.pagination(query);
    const search = query.search?.trim();

    const [data, total] = await this.centerRepo.findAndCount({
      where: search
        ? [
            { name: ILike(`%${search}%`) },
            { code: ILike(`%${search}%`) },
            { address: ILike(`%${search}%`) },
          ]
        : {},
      order: { createdAt: 'DESC', id: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async getCenter(id: string) {
    const item = await this.centerRepo.findOneBy({ id });
    if (!item) {
      throw new NotFoundException('Không tìm thấy trung tâm đăng kiểm');
    }
    return item;
  }

  async createCenter(dto: CreateCenterDto) {
    const code = dto.code.trim().toUpperCase();

    const exists = await this.centerRepo.findOneBy({ code });
    if (exists) throw new ConflictException('Mã trung tâm đã tồn tại');

    return this.centerRepo.save(
      this.centerRepo.create({
        code,
        name: dto.name.trim(),
        address: dto.address.trim(),
        phone: dto.phone?.trim() || null,
        latitude: this.validateCoordinate(dto.latitude, -90, 90),
        longitude: this.validateCoordinate(dto.longitude, -180, 180),
        description: dto.description?.trim() || null,
        status: dto.status,
      }),
    );
  }

  async updateCenter(id: string, dto: UpdateCenterDto) {
    const item = await this.getCenter(id);
    const code = dto.code.trim().toUpperCase();

    const exists = await this.centerRepo.findOneBy({ code });
    if (exists && exists.id !== id) {
      throw new ConflictException('Mã trung tâm đã tồn tại');
    }

    item.code = code;
    item.name = dto.name.trim();
    item.address = dto.address.trim();
    item.phone = dto.phone?.trim() || null;
    item.latitude = this.validateCoordinate(dto.latitude, -90, 90);
    item.longitude = this.validateCoordinate(dto.longitude, -180, 180);
    item.description = dto.description?.trim() || null;
    item.status = dto.status;

    return this.centerRepo.save(item);
  }

  async setCenterStatus(id: string, status: 'active' | 'inactive') {
    const item = await this.getCenter(id);
    item.status = status;
    return this.centerRepo.save(item);
  }
}
