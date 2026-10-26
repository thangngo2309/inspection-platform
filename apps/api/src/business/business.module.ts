import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { BUSINESS_ENTITIES } from './business-entities.js';

import { AuthController } from './auth/auth.controller.js';
import { AuthService } from './auth/auth.service.js';
import { AccessTokenGuard } from './auth/access-token.guard.js';
import { RolesGuard } from './auth/roles.guard.js';
import {
  AdminBookingController,
  BookingOptionsController,
  CustomerBookingController,
} from './bookings/booking.controller.js';
import { BookingService } from './bookings/booking.service.js';
import { CatalogService } from './catalog/catalog.service.js';
import {
  AdminCentersController,
  AdminServicesController,
} from './catalog/catalog.controller.js';
import { SlotService } from './slots/slot.service.js';
import { StaffService } from './staff/staff.service.js';
import { StaffController } from './staff/staff.controller.js';
import { SlotController } from './slots/slot.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([...BUSINESS_ENTITIES]),
    JwtModule.register({}),
  ],
  controllers: [
    AuthController,
    AdminBookingController,
    BookingOptionsController,
    CustomerBookingController,
    AdminServicesController,
    AdminCentersController,
    StaffController,
    SlotController,
  ],
  providers: [
    AuthService,
    AccessTokenGuard,
    RolesGuard,
    BookingService,
    CatalogService,
    StaffService,
    SlotService,
  ],
  exports: [
    TypeOrmModule,
    AuthService,
    BookingService,
    AccessTokenGuard,
    RolesGuard,
  ],
})
export class BusinessModule {}
