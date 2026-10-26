import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import { AccessTokenGuard } from '../auth/access-token.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '../auth/auth.types.js';

import {
  CustomerVehiclesService,
  type DirectoryQuery,
} from './customer-vehicles.service.js';

export class DirectoryQueryDto implements DirectoryQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @IsString()
  search?: string;
}

@Controller('admin')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
export class CustomerVehiclesController {
  constructor(private readonly service: CustomerVehiclesService) {}

  @Get('customers')
  customers(@Query() query: DirectoryQueryDto) {
    return this.service.customers(query);
  }

  @Get('customers/:phone')
  customerDetail(@Param('phone') phone: string) {
    return this.service.customerDetail(phone);
  }

  @Get('vehicles')
  vehicles(@Query() query: DirectoryQueryDto) {
    return this.service.vehicles(query);
  }

  @Get('vehicles/:plate')
  vehicleDetail(@Param('plate') plate: string) {
    return this.service.vehicleDetail(plate);
  }
}
