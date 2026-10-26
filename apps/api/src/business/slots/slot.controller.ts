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

import { SlotService } from './slot.service.js';

import {
  AdminSlotListDto,
  ChangeSlotStatusDto,
  CreateSlotDto,
  UpdateSlotDto,
} from './slot.dto.js';

@Controller('admin/slot-management')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
export class SlotController {
  constructor(private readonly service: SlotService) {}

  @Get()
  list(@Query() query: AdminSlotListDto) {
    return this.service.list(query);
  }

  @Post()
  create(@Body() dto: CreateSlotDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSlotDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body() dto: ChangeSlotStatusDto) {
    return this.service.changeStatus(id, dto.status);
  }
}
