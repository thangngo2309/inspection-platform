import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @IsNumberString()
  centerId!: string;

  @IsNumberString()
  slotId!: string;

  @IsNumberString()
  serviceId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  customerName!: string;

  @Matches(/^0\d{9}$/)
  customerPhone!: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  licensePlate!: string;

  @IsString()
  @IsNotEmpty()
  vehicleType!: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  manufactureYear?: number;

  @IsOptional()
  @IsString()
  chassisNumber?: string;

  @IsOptional()
  @IsString()
  engineNumber?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  seats?: number;

  @IsOptional()
  @IsString()
  payloadKg?: string;

  @IsOptional()
  @IsString()
  inspectionExpiryDate?: string;

  @IsOptional()
  @IsString()
  insuranceExpiryDate?: string;

  @IsBoolean()
  pickupRequired!: boolean;

  @ValidateIf((o: CreateBookingDto) => o.pickupRequired)
  @IsString()
  @IsNotEmpty()
  pickupAddress?: string;

  @IsOptional()
  @IsString()
  returnAddress?: string;

  @IsOptional()
  @IsString()
  customerNote?: string;
}

export class SlotQueryDto {
  @IsNumberString()
  centerId!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @IsString()
  @IsNotEmpty()
  vehicleType!: string;
}

export class ListBookingsDto {
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

  @IsOptional()
  @IsString()
  status?: string;
}

export class AssignBookingDto {
  @IsNumberString()
  staffId!: string;
}

export class ConfigureSlotStaffDto {
  @IsNumberString()
  staffId!: string;
}
