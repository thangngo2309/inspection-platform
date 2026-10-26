import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AccessTokenGuard } from '../auth/access-token.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '../auth/auth.types.js';

import { StaffService, type StaffDetail } from './staff.service.js';
import {
  ChangeStaffStatusDto,
  CreateStaffDto,
  StaffListDto,
  UpdateStaffDto,
} from './staff.dto.js';

@Controller('admin/staff-management')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
export class StaffController {
  constructor(private readonly service: StaffService) {}

  @Get()
  list(@Query() query: StaffListDto) {
    return this.service.list(query);
  }

  @Get(':id')
  detail(@Param('id') id: string): Promise<StaffDetail> {
    return this.service.detail(id);
  }

  @Post()
  create(@Body() dto: CreateStaffDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStaffDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body() dto: ChangeStaffStatusDto) {
    return this.service.changeStatus(id, dto.active);
  }
}
