import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
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
  BookingService,
  type BookingSlotResponse,
  type AdminStaffRow,
  type SlotStaffRow,
} from './booking.service.js';

import {
  AssignBookingDto,
  ConfigureSlotStaffDto,
  CreateBookingDto,
  ListBookingsDto,
  SlotQueryDto,
} from './booking.dto.js';

@Controller('booking-options')
export class BookingOptionsController {
  constructor(private readonly service: BookingService) {}

  @Get('centers')
  centers() {
    return this.service.centers();
  }

  @Get('services')
  services() {
    return this.service.services();
  }

  @Get('slots')
  slots(@Query() query: SlotQueryDto): Promise<BookingSlotResponse[]> {
    return this.service.slots(query);
  }
}

@Controller('bookings')
export class CustomerBookingController {
  constructor(private readonly service: BookingService) {}

  /**
   * Public API
   * Khách không cần đăng nhập để đặt lịch.
   */
  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.service.create(dto);
  }

  /**
   * Chỉ khách đã đăng nhập mới xem được
   * danh sách booking liên kết với tài khoản.
   */
  @Get('my')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  myBookings(@Req() req: AuthenticatedRequest) {
    return this.service.myBookings(req.authUser!.sub);
  }
}

@Controller('admin')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
export class AdminBookingController {
  constructor(private readonly service: BookingService) {}

  @Get('bookings')
  bookings(@Query() query: ListBookingsDto) {
    return this.service.adminList(query);
  }

  @Get('staff')
  staff(): Promise<AdminStaffRow[]> {
    return this.service.staff();
  }

  @Get('slots/:id/staff')
  slotStaff(@Param('id') id: string): Promise<SlotStaffRow[]> {
    return this.service.slotStaff(id);
  }

  @Post('slots/:id/staff')
  configureStaff(@Param('id') id: string, @Body() dto: ConfigureSlotStaffDto) {
    return this.service.configureStaff(id, dto);
  }

  @Delete('slots/:id/staff/:staffId')
  removeStaff(@Param('id') id: string, @Param('staffId') staffId: string) {
    return this.service.removeStaff(id, staffId);
  }

  @Post('bookings/:id/assign')
  assign(
    @Param('id') id: string,
    @Body() dto: AssignBookingDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.assign(id, dto, req.authUser!.sub);
  }

  @Get('slots')
  adminSlots(
    @Query('centerId') centerId?: string,
    @Query('date') date?: string,
  ) {
    return this.service.adminSlots({ centerId, date });
  }
}
