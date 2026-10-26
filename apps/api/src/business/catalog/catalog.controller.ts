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

import { CatalogService } from './catalog.service.js';
import {
  CatalogListDto,
  ChangeCatalogStatusDto,
  ChangeCenterStatusDto,
  CreateCenterDto,
  CreateServiceDto,
  UpdateCenterDto,
  UpdateServiceDto,
} from './catalog.dto.js';

@Controller('admin/services')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
export class AdminServicesController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  list(@Query() query: CatalogListDto) {
    return this.catalog.listServices(query);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.catalog.getService(id);
  }

  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.catalog.createService(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.catalog.updateService(id, dto);
  }

  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body() dto: ChangeCatalogStatusDto) {
    return this.catalog.setServiceStatus(id, dto.active);
  }
}

@Controller('admin/centers')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
export class AdminCentersController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  list(@Query() query: CatalogListDto) {
    return this.catalog.listCenters(query);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.catalog.getCenter(id);
  }

  @Post()
  create(@Body() dto: CreateCenterDto) {
    return this.catalog.createCenter(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCenterDto) {
    return this.catalog.updateCenter(id, dto);
  }

  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body() dto: ChangeCenterStatusDto) {
    return this.catalog.setCenterStatus(id, dto.status);
  }
}
