import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Booking, Customer } from '../entities/inspection.entities.js';

export interface MyBookingRow {
  id: string;
  bookingCode: string;
  status: string;
  customerName: string;
  licensePlate: string;
  serviceName: string;
  totalAmount: string;
  slotDate: string | null;
  startTime: string | null;
  endTime: string | null;
  centerName: string | null;
  staffName: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface MyVehicleRow {
  id: string;
  licensePlate: string;
  vehicleType: string | null;
  brand: string | null;
  model: string | null;
  manufactureYear: number | null;
  chassisNumber: string | null;
  engineNumber: string | null;
  bookingCount: number;
  lastBookingAt: string | null;
}

export interface MyAccountPage<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface MyAccountQuery {
  page?: number;
  limit?: number;
}

@Injectable()
export class CustomerAccountService {
  constructor(private readonly db: DataSource) {}

  private async customerId(userId: string): Promise<string> {
    const customer = await this.db
      .getRepository(Customer)
      .findOneBy({ userId });

    if (!customer) {
      throw new NotFoundException('Không tìm thấy hồ sơ khách hàng');
    }

    return customer.id;
  }

  private paging(query: MyAccountQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    return {
      page,
      limit,
      offset: (page - 1) * limit,
    };
  }

  private bookingQuery() {
    return this.db
      .getRepository(Booking)
      .createQueryBuilder('booking')
      .leftJoin(
        'center_time_slots',
        'slot',
        '"slot"."id" = "booking"."slot_id"',
      )
      .leftJoin(
        'inspection_centers',
        'center',
        '"center"."id" = "booking"."center_id"',
      )
      .leftJoin(
        'staff_assignments',
        'assignment',
        `
            "assignment"."booking_id" = "booking"."id"
            AND "assignment"."status" IN ('assigned', 'accepted')
          `,
      )
      .leftJoin(
        'staff_profiles',
        'staff',
        '"staff"."id" = "assignment"."staff_id"',
      )
      .leftJoin('users', 'staff_user', '"staff_user"."id" = "staff"."user_id"')
      .select('booking.id', 'id')
      .addSelect('booking.bookingCode', 'bookingCode')
      .addSelect('booking.status', 'status')
      .addSelect('booking.customerName', 'customerName')
      .addSelect('booking.licensePlate', 'licensePlate')
      .addSelect('booking.serviceName', 'serviceName')
      .addSelect('booking.totalAmount', 'totalAmount')
      .addSelect('slot.slot_date', 'slotDate')
      .addSelect('slot.start_time', 'startTime')
      .addSelect('slot.end_time', 'endTime')
      .addSelect('center.name', 'centerName')
      .addSelect('staff_user.full_name', 'staffName')
      .addSelect('booking.createdAt', 'createdAt')
      .addSelect('booking.completedAt', 'completedAt');
  }

  async bookings(
    userId: string,
    query: MyAccountQuery,
  ): Promise<MyAccountPage<MyBookingRow>> {
    const customerId = await this.customerId(userId);
    const { page, limit, offset } = this.paging(query);

    const total = await this.db.getRepository(Booking).count({
      where: { customerId },
    });

    const data = await this.bookingQuery()
      .where('booking.customerId = :customerId', {
        customerId,
      })
      .orderBy('booking.createdAt', 'DESC')
      .addOrderBy('booking.id', 'DESC')
      .offset(offset)
      .limit(limit)
      .getRawMany<MyBookingRow>();

    return { data, total, page, limit };
  }

  async bookingDetail(
    userId: string,
    bookingId: string,
  ): Promise<MyBookingRow> {
    const customerId = await this.customerId(userId);

    const row = await this.bookingQuery()
      .where('booking.customerId = :customerId', {
        customerId,
      })
      .andWhere('booking.id = :bookingId', {
        bookingId,
      })
      .getRawOne<MyBookingRow>();

    if (!row) {
      throw new NotFoundException('Không tìm thấy booking thuộc tài khoản');
    }

    return row;
  }

  /**
   * Danh sách xe từ những booking liên kết tài khoản.
   *
   * Đây là danh sách phương tiện từng được đặt lịch,
   * không phải danh sách xác minh quyền sở hữu xe.
   */
  async vehicles(userId: string): Promise<MyVehicleRow[]> {
    const customerId = await this.customerId(userId);

    const rows = (await this.db.query(
      `
          WITH normalized AS (
            SELECT
              UPPER(
                regexp_replace(
                  b.license_plate,
                  '[^A-Za-z0-9]',
                  '',
                  'g'
                )
              ) AS plate,
              b.vehicle_snapshot,
              b.created_at,
              b.id
            FROM bookings b
            WHERE b.customer_id = $1
          ),
          grouped AS (
            SELECT
              plate,
              (
                array_agg(
                  vehicle_snapshot
                  ORDER BY
                    (vehicle_snapshot IS NOT NULL) DESC,
                    created_at DESC,
                    id DESC
                )
              )[1] AS snapshot,
              COUNT(*)::int AS booking_count,
              MAX(created_at) AS last_booking_at
            FROM normalized
            WHERE plate <> ''
            GROUP BY plate
          )
          SELECT
            plate AS id,
            plate AS "licensePlate",
            snapshot->>'vehicleType' AS "vehicleType",
            snapshot->>'brand' AS brand,
            snapshot->>'model' AS model,
            CASE
              WHEN snapshot->>'manufactureYear'
                ~ '^[0-9]{4}$'
              THEN (snapshot->>'manufactureYear')::int
              ELSE NULL
            END AS "manufactureYear",
            snapshot->>'chassisNumber' AS "chassisNumber",
            snapshot->>'engineNumber' AS "engineNumber",
            booking_count AS "bookingCount",
            last_booking_at AS "lastBookingAt"
          FROM grouped
          ORDER BY last_booking_at DESC, plate
        `,
      [customerId],
    )) as MyVehicleRow[];

    return rows;
  }

  async vehicleDetail(userId: string, plate: string) {
    const normalized = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');

    const vehicles = await this.vehicles(userId);
    const vehicle = vehicles.find((item) => item.id === normalized);

    if (!vehicle) {
      throw new NotFoundException(
        'Không tìm thấy phương tiện thuộc lịch sử tài khoản',
      );
    }

    const customerId = await this.customerId(userId);

    const bookings = await this.bookingQuery()
      .where('booking.customerId = :customerId', {
        customerId,
      })
      .andWhere(
        `
            UPPER(
              regexp_replace(
                "booking"."license_plate",
                '[^A-Za-z0-9]',
                '',
                'g'
              )
            ) = :plate
          `,
        { plate: normalized },
      )
      .orderBy('booking.createdAt', 'DESC')
      .getRawMany<MyBookingRow>();

    return { vehicle, bookings };
  }

  /**
   * Lịch sử các booking đã hoàn thành dịch vụ hỗ trợ.
   * Không kết luận xe đạt hay không đạt kiểm định.
   */
  async history(
    userId: string,
    query: MyAccountQuery,
  ): Promise<MyAccountPage<MyBookingRow>> {
    const customerId = await this.customerId(userId);
    const { page, limit, offset } = this.paging(query);

    const where = {
      customerId,
      status: 'completed',
    };

    const total = await this.db.getRepository(Booking).count({ where });

    const data = await this.bookingQuery()
      .where('booking.customerId = :customerId', {
        customerId,
      })
      .andWhere('booking.status = :status', {
        status: 'completed',
      })
      .orderBy('booking.completedAt', 'DESC')
      .addOrderBy('booking.id', 'DESC')
      .offset(offset)
      .limit(limit)
      .getRawMany<MyBookingRow>();

    return { data, total, page, limit };
  }
}
