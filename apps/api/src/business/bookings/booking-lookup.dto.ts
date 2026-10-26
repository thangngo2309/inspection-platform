import { IsString, Matches, MaxLength } from 'class-validator';

export class BookingLookupDto {
  @IsString()
  @MaxLength(40)
  @Matches(/^DK-[A-F0-9]{16}$/i, {
    message: 'Mã đặt lịch không đúng định dạng',
  })
  bookingCode!: string;

  @IsString()
  @Matches(/^0\d{9}$/, {
    message: 'Số điện thoại phải gồm 10 chữ số',
  })
  phone!: string;
}
