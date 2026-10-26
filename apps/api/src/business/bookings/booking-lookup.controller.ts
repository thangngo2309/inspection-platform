import { Body, Controller, Post } from '@nestjs/common';

import {
  BookingLookupService,
  type BookingLookupResponse,
} from './booking-lookup.service.js';

import { BookingLookupDto } from './booking-lookup.dto.js';

@Controller('booking-lookup')
export class BookingLookupController {
  constructor(private readonly service: BookingLookupService) {}

  /**
   * Public endpoint.
   *
   * POST thay vì GET để không đưa số điện thoại
   * vào query string hay lịch sử trình duyệt.
   */
  @Post()
  lookup(@Body() dto: BookingLookupDto): Promise<BookingLookupResponse> {
    return this.service.lookup(dto);
  }
}
