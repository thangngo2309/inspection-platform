
import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Header,
  UseGuards,
} from "@nestjs/common";

import { Type } from "class-transformer";

import {
  IsInt,
  IsOptional,
  Max,
  Min,
} from "class-validator";

import {
  AccessTokenGuard,
  type AuthenticatedRequest,
} from "../auth/access-token.guard.js";

import { RolesGuard } from "../auth/roles.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { UserRole } from "../auth/auth.types.js";

import {
  CustomerAccountService,
  type MyAccountQuery,
} from "./customer-account.service.js";

export class MyAccountQueryDto implements MyAccountQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}

@Controller("account")
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class CustomerAccountController {
  constructor(
    private readonly service: CustomerAccountService,
  ) {}

  // Booking của tài khoản
  @Get("bookings")
  bookings(
    @Req() req: AuthenticatedRequest,
    @Query() query: MyAccountQueryDto,
  ) {
    return this.service.bookings(
      req.authUser!.sub,
      query,
    );
  }

  // Chi tiết booking
  @Get("bookings/:id")
  bookingDetail(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
  ) {
    return this.service.bookingDetail(
      req.authUser!.sub,
      id,
    );
  }

  // Lịch sử dịch vụ đã hoàn thành
  @Get("history")
  history(
    @Req() req: AuthenticatedRequest,
    @Query() query: MyAccountQueryDto,
  ) {
    return this.service.history(
      req.authUser!.sub,
      query,
    );
  }
}
