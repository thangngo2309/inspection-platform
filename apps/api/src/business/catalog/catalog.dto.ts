import {
  IsEmail,
  IsIn,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  IsBoolean,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CatalogListDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;

  @IsOptional()
  @IsString()
  search?: string;
}

export class CreateServiceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  code!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @MinLength(2)
  serviceType!: string;

  @IsNumberString()
  basePrice!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateServiceDto extends CreateServiceDto {}

export class CreateCenterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  code!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @IsString()
  @MinLength(5)
  address!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsNumberString()
  latitude?: string;

  @IsOptional()
  @IsNumberString()
  longitude?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['active', 'inactive'])
  status!: 'active' | 'inactive';
}

export class UpdateCenterDto extends CreateCenterDto {}

export class ChangeCatalogStatusDto {
  @IsBoolean()
  active!: boolean;
}

export class ChangeCenterStatusDto {
  @IsIn(['active', 'inactive'])
  status!: 'active' | 'inactive';
}
