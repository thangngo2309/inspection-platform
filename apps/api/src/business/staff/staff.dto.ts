import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class StaffListDto {
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

export class CreateStaffDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  fullName!: string;

  @Matches(/^0\d{9}$/)
  phone!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  employeeCode!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsString()
  driverLicenseNumber?: string;

  @IsOptional()
  @IsString()
  serviceArea?: string;

  @IsOptional()
  @IsIn(['available', 'unavailable'])
  status?: string;
}

export class UpdateStaffDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  fullName!: string;

  @Matches(/^0\d{9}$/)
  phone!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  employeeCode!: string;

  @IsOptional()
  @IsString()
  driverLicenseNumber?: string;

  @IsOptional()
  @IsString()
  serviceArea?: string;

  @IsIn(['available', 'unavailable'])
  status!: string;
}

export class ChangeStaffStatusDto {
  @IsBoolean()
  active!: boolean;
}
