import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  AccessTokenGuard,
  type AuthenticatedRequest,
} from '../auth/access-token.guard.js';

import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '../auth/auth.types.js';

import {
  CreateCustomerVehicleDto,
  UpdateCustomerVehicleDto,
} from './customer-vehicle.dto.js';

import { CustomerVehicleService } from './customer-vehicle.service.js';

@Controller('account/vehicles')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class CustomerVehicleController {
  constructor(private readonly service: CustomerVehicleService) {}

  @Get()
  list(@Req() req: AuthenticatedRequest) {
    return this.service.list(req.authUser!.sub);
  }

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCustomerVehicleDto,
  ) {
    return this.service.create(req.authUser!.sub, dto);
  }

  @Get(':id/bookings')
  bookingHistory(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.bookingHistory(req.authUser!.sub, id);
  }

  @Get(':id')
  detail(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.detail(req.authUser!.sub, id);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerVehicleDto,
  ) {
    return this.service.update(req.authUser!.sub, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.remove(req.authUser!.sub, id);
  }
}
