import { Injectable, NotFoundException } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { BookingLookupDto } from './booking-lookup.dto.js';

// ======================================================
// RESPONSE TYPES
// ======================================================

export interface BookingLookupResponse {
  id: string;
  bookingCode: string;
  status: string;
  createdAt: string;

  customerName: string;

  licensePlate: string;
  vehicleType: string | null;
  brand: string | null;
  model: string | null;

  serviceName: string;
  totalAmount: string;

  slotDate: string | null;
  startTime: string | null;
  endTime: string | null;

  centerName: string | null;
  centerAddress: string | null;

  staffName: string | null;

  pickupRequired: boolean;

  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
}

@Injectable()
export class BookingLookupService {
  constructor(private readonly db: DataSource) {}

  async lookup(dto: BookingLookupDto): Promise<BookingLookupResponse> {
    const bookingCode = dto.bookingCode.trim().toUpperCase();

    const phone = dto.phone.replace(/\D/g, '');

    /**
     * Chỉ trả kết quả khi mã booking và
     * số điện thoại liên hệ cùng khớp.
     *
     * Dùng truy vấn tham số hóa để tránh SQL injection.
     *
     * LATERAL JOIN chọn assignment đang hiệu lực.
     * Không trả assignment cũ đã hủy.
     */
    const rows = (await this.db.query(
      `
        SELECT
          b.id::text AS "id",
  
          b.booking_code AS "bookingCode",
          b.status AS "status",
          b.created_at AS "createdAt",
  
          b.customer_name AS "customerName",
  
          b.license_plate AS "licensePlate",
  
          b.vehicle_snapshot->>'vehicleType'
            AS "vehicleType",
  
          b.vehicle_snapshot->>'brand'
            AS "brand",
  
          b.vehicle_snapshot->>'model'
            AS "model",
  
          b.service_name AS "serviceName",
  
          b.total_amount::text AS "totalAmount",
  
          slot.slot_date::text AS "slotDate",
          slot.start_time::text AS "startTime",
          slot.end_time::text AS "endTime",
  
          center.name AS "centerName",
          center.address AS "centerAddress",
  
          staff_user.full_name AS "staffName",
  
          b.pickup_required AS "pickupRequired",
  
          b.confirmed_at AS "confirmedAt",
          b.completed_at AS "completedAt",
          b.cancelled_at AS "cancelledAt"
  
        FROM bookings b
  
        LEFT JOIN center_time_slots slot
          ON slot.id = b.slot_id
  
        LEFT JOIN inspection_centers center
          ON center.id = b.center_id
  
        LEFT JOIN LATERAL (
          SELECT
            assignment.staff_id
          FROM staff_assignments assignment
  
          WHERE assignment.booking_id = b.id
            AND assignment.status IN (
              'assigned',
              'accepted'
            )
  
          ORDER BY
            assignment.assigned_at DESC,
            assignment.id DESC
  
          LIMIT 1
        ) current_assignment
          ON TRUE
  
        LEFT JOIN staff_profiles staff
          ON staff.id = current_assignment.staff_id
  
        LEFT JOIN users staff_user
          ON staff_user.id = staff.user_id
  
        WHERE UPPER(b.booking_code) = $1
  
          AND regexp_replace(
            b.customer_phone,
            '[^0-9]',
            '',
            'g'
          ) = $2
  
        LIMIT 1
        `,
      [bookingCode, phone],
    )) as BookingLookupResponse[];

    if (!rows.length) {
      throw new NotFoundException(
        'Không tìm thấy lịch đặt phù hợp với thông tin đã nhập',
      );
    }

    return rows[0];
  }
}
