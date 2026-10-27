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
import { CustomerVehiclesController } from './customer-vehicles/customer-vehicles.controller.js';
import { CustomerVehiclesService } from './customer-vehicles/customer-vehicles.service.js';
import { BookingLookupController } from './bookings/booking-lookup.controller.js';
import { BookingLookupService } from './bookings/booking-lookup.service.js';
import { CustomerAccountController } from './customer-account/customer-account.controller.js';
import { CustomerAccountService } from './customer-account/customer-account.service.js';
import { CustomerVehicleController } from './customer-account/customer-vehicle.controller.js';
import { CustomerVehicleService } from './customer-account/customer-vehicle.service.js';

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
    CustomerVehiclesController,
    BookingLookupController,
    CustomerAccountController,
    CustomerVehicleController,
  ],
  providers: [
    AuthService,
    AccessTokenGuard,
    RolesGuard,
    BookingService,
    CatalogService,
    StaffService,
    SlotService,
    CustomerVehiclesService,
    BookingLookupService,
    CustomerAccountService,
    CustomerVehicleService,
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
