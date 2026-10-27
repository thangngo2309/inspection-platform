import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface HistoryRow {
  id: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  licensePlate: string;
  vehicleSnapshot: Record<string, unknown> | null;
  centerName: string | null;
  serviceName: string;
  slotDate: string | null;
  startTime: string | null;
  status: string;
  totalAmount: string;
  staffName: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface CustomerRow {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  bookingCount: number;
  vehicleCount: number;
  lastBookingAt: string | null;
  hasAccount: boolean;
}

export interface VehicleRow {
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
  customerName: string;
  customerPhone: string;

  registeredVehicleId: string | null;
  customerId: string | null;
  isRegistered: boolean;
}

export interface PageResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface DirectoryQuery {
  page?: number;
  limit?: number;
  search?: string;
}

@Injectable()
export class CustomerVehiclesService {
  constructor(private readonly db: DataSource) {}

  private pagination(query: DirectoryQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    return {
      page,
      limit,
      offset: (page - 1) * limit,
    };
  }

  /**
   * Không giả định rằng số điện thoại đã được OTP xác minh.
   * Chỉ dùng khóa này để nhóm dữ liệu vận hành.
   */
  private readonly customerDirectorySql = `
      WITH booking_contacts AS (
        SELECT
          regexp_replace(
            b.customer_phone,
            '[^0-9]',
            '',
            'g'
          ) AS phone,
          b.customer_name,
          b.customer_email,
          b.license_plate,
          b.created_at,
          b.id
        FROM bookings b
        WHERE b.customer_phone IS NOT NULL
          AND b.customer_phone <> ''
      ),
      customers_from_bookings AS (
        SELECT
          phone,
          (array_agg(
            customer_name ORDER BY created_at DESC, id DESC
          ))[1] AS full_name,
          (array_agg(
            customer_email ORDER BY
              (customer_email IS NOT NULL) DESC,
              created_at DESC,
              id DESC
          ))[1] AS email,
          COUNT(*)::int AS booking_count,
          COUNT(DISTINCT UPPER(
            regexp_replace(
              license_plate,
              '[^A-Za-z0-9]',
              '',
              'g'
            )
          ))::int AS vehicle_count,
          MAX(created_at) AS last_booking_at
        FROM booking_contacts
        WHERE phone <> ''
        GROUP BY phone
      ),
      registered_accounts AS (
        SELECT
          regexp_replace(u.phone, '[^0-9]', '', 'g') AS phone,
          u.full_name,
          u.email
        FROM users u
        WHERE u.role = 'customer'
      ),
      combined AS (
        SELECT
          COALESCE(b.phone, u.phone) AS phone,
          COALESCE(b.full_name, u.full_name) AS full_name,
          COALESCE(b.email, u.email) AS email,
          COALESCE(b.booking_count, 0) AS booking_count,
          COALESCE(b.vehicle_count, 0) AS vehicle_count,
          b.last_booking_at,
          (u.phone IS NOT NULL) AS has_account
        FROM customers_from_bookings b
        FULL OUTER JOIN registered_accounts u
          ON u.phone = b.phone
      )
      SELECT
        phone AS id,
        full_name AS "fullName",
        phone,
        email,
        booking_count AS "bookingCount",
        vehicle_count AS "vehicleCount",
        last_booking_at AS "lastBookingAt",
        has_account AS "hasAccount"
      FROM combined
    `;

  private readonly vehicleDirectorySql = `
    WITH registered_vehicles AS (
      SELECT
        UPPER(
          regexp_replace(
            v.license_plate,
            '[^A-Za-z0-9]',
            '',
            'g'
          )
        ) AS plate,

        v.id AS registered_vehicle_id,
        v.customer_id,
        v.license_plate,
        v.vehicle_type,
        v.brand,
        v.model,
        v.manufacture_year,
        v.chassis_number,
        v.engine_number,
        v.created_at,

        u.full_name AS registered_customer_name,
        u.phone AS registered_customer_phone

      FROM vehicles v

      INNER JOIN customers c
        ON c.id = v.customer_id

      INNER JOIN users u
        ON u.id = c.user_id
    ),

    registered_grouped AS (
      SELECT DISTINCT ON (plate)
        plate,
        registered_vehicle_id,
        customer_id,
        license_plate,
        vehicle_type,
        brand,
        model,
        manufacture_year,
        chassis_number,
        engine_number,
        registered_customer_name,
        registered_customer_phone
      FROM registered_vehicles
      WHERE plate <> ''
      ORDER BY
        plate,
        created_at DESC,
        registered_vehicle_id DESC
    ),

    booking_vehicles AS (
      SELECT
        UPPER(
          regexp_replace(
            b.license_plate,
            '[^A-Za-z0-9]',
            '',
            'g'
          )
        ) AS plate,

        b.customer_name,
        b.customer_phone,
        b.vehicle_snapshot,
        b.created_at,
        b.id

      FROM bookings b

      WHERE b.license_plate IS NOT NULL
        AND b.license_plate <> ''
    ),

    booking_grouped AS (
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

        (
          array_agg(
            customer_name
            ORDER BY created_at DESC, id DESC
          )
        )[1] AS customer_name,

        (
          array_agg(
            customer_phone
            ORDER BY created_at DESC, id DESC
          )
        )[1] AS customer_phone,

        COUNT(*)::int AS booking_count,
        MAX(created_at) AS last_booking_at

      FROM booking_vehicles
      WHERE plate <> ''
      GROUP BY plate
    )

    SELECT
      COALESCE(r.plate, b.plate) AS id,

      COALESCE(
        r.license_plate,
        b.plate
      ) AS "licensePlate",

      COALESCE(
        r.vehicle_type,
        b.snapshot->>'vehicleType'
      ) AS "vehicleType",

      COALESCE(
        NULLIF(r.brand, ''),
        b.snapshot->>'brand'
      ) AS brand,

      COALESCE(
        NULLIF(r.model, ''),
        b.snapshot->>'model'
      ) AS model,

      COALESCE(
        r.manufacture_year,

        CASE
          WHEN b.snapshot->>'manufactureYear'
            ~ '^[0-9]{4}$'
          THEN
            (b.snapshot->>'manufactureYear')::int
          ELSE NULL
        END
      ) AS "manufactureYear",

      COALESCE(
        NULLIF(r.chassis_number, ''),
        b.snapshot->>'chassisNumber'
      ) AS "chassisNumber",

      COALESCE(
        NULLIF(r.engine_number, ''),
        b.snapshot->>'engineNumber'
      ) AS "engineNumber",

      COALESCE(
        b.booking_count,
        0
      ) AS "bookingCount",

      b.last_booking_at AS "lastBookingAt",

      COALESCE(
        r.registered_customer_name,
        b.customer_name,
        'Chưa có thông tin'
      ) AS "customerName",

      COALESCE(
        r.registered_customer_phone,
        b.customer_phone,
        ''
      ) AS "customerPhone",

      r.registered_vehicle_id::text AS "registeredVehicleId",
      r.customer_id::text AS "customerId",

      (r.registered_vehicle_id IS NOT NULL)
        AS "isRegistered"

    FROM registered_grouped r

    FULL OUTER JOIN booking_grouped b
      ON b.plate = r.plate
    `;

  private readonly historySql = `
      SELECT
        b.id::text AS id,
        b.booking_code AS "bookingCode",
        b.customer_name AS "customerName",
        b.customer_phone AS "customerPhone",
        b.license_plate AS "licensePlate",
        b.vehicle_snapshot AS "vehicleSnapshot",
        center.name AS "centerName",
        b.service_name AS "serviceName",
        slot.slot_date::text AS "slotDate",
        slot.start_time::text AS "startTime",
        b.status,
        b.total_amount::text AS "totalAmount",
        staff_user.full_name AS "staffName",
        b.created_at AS "createdAt",
        b.completed_at AS "completedAt"
      FROM bookings b
      LEFT JOIN inspection_centers center
        ON center.id = b.center_id
      LEFT JOIN center_time_slots slot
        ON slot.id = b.slot_id
      LEFT JOIN LATERAL (
        SELECT a.staff_id
        FROM staff_assignments a
        WHERE a.booking_id = b.id
        ORDER BY
          CASE WHEN a.status IN ('assigned', 'accepted')
            THEN 0 ELSE 1 END,
          a.assigned_at DESC,
          a.id DESC
        LIMIT 1
      ) assignment ON TRUE
      LEFT JOIN staff_profiles staff
        ON staff.id = assignment.staff_id
      LEFT JOIN users staff_user
        ON staff_user.id = staff.user_id
    `;

  async customers(query: DirectoryQuery): Promise<PageResult<CustomerRow>> {
    const { page, limit, offset } = this.pagination(query);
    const search = `%${query.search?.trim() ?? ''}%`;

    const where = `
        WHERE (
          "fullName" ILIKE $1
          OR phone ILIKE $1
          OR COALESCE(email, '') ILIKE $1
        )
      `;

    const countRows = (await this.db.query(
      `SELECT COUNT(*)::int AS total
         FROM (${this.customerDirectorySql}) directory
         ${where}`,
      [search],
    )) as Array<{ total: number }>;

    const data = (await this.db.query(
      `SELECT *
         FROM (${this.customerDirectorySql}) directory
         ${where}
         ORDER BY "lastBookingAt" DESC NULLS LAST, phone
         LIMIT $2 OFFSET $3`,
      [search, limit, offset],
    )) as CustomerRow[];

    return {
      data,
      total: Number(countRows[0]?.total ?? 0),
      page,
      limit,
    };
  }

  async customerDetail(phone: string) {
    const normalized = phone.replace(/\D/g, '');

    const rows = (await this.db.query(
      `
      SELECT *
      FROM (${this.customerDirectorySql}) directory
      WHERE phone = $1
    `,
      [normalized],
    )) as CustomerRow[];

    if (!rows.length) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }

    // Lịch sử booking theo số điện thoại liên hệ.
    const history = (await this.db.query(
      `
      ${this.historySql}
      WHERE regexp_replace(
        b.customer_phone,
        '[^0-9]',
        '',
        'g'
      ) = $1
      ORDER BY b.created_at DESC, b.id DESC
    `,
      [normalized],
    )) as HistoryRow[];

    // Lấy biển số từ các booking của người liên hệ.
    const plates = new Set(
      history
        .map((row) => row.licensePlate.toUpperCase().replace(/[^A-Z0-9]/g, ''))
        .filter(Boolean),
    );

    // Bổ sung các xe được lưu trực tiếp vào tài khoản.
    // Liên kết từ users.phone -> customers.user_id
    // -> vehicles.customer_id.
    const registeredPlates = (await this.db.query(
      `
      SELECT DISTINCT
        UPPER(
          regexp_replace(
            v.license_plate,
            '[^A-Za-z0-9]',
            '',
            'g'
          )
        ) AS plate
      FROM vehicles v
      INNER JOIN customers c
        ON c.id = v.customer_id
      INNER JOIN users u
        ON u.id = c.user_id
      WHERE regexp_replace(
        u.phone,
        '[^0-9]',
        '',
        'g'
      ) = $1
    `,
      [normalized],
    )) as Array<{ plate: string }>;

    for (const item of registeredPlates) {
      if (item.plate) {
        plates.add(item.plate);
      }
    }

    const vehicles = plates.size
      ? ((await this.db.query(
          `
          SELECT *
          FROM (${this.vehicleDirectorySql}) directory
          WHERE id = ANY($1::text[])
          ORDER BY
            "lastBookingAt" DESC NULLS LAST,
            "licensePlate" ASC
        `,
          [[...plates]],
        )) as VehicleRow[])
      : [];

    return {
      customer: rows[0],
      vehicles,
      history,
    };
  }

  async vehicles(query: DirectoryQuery): Promise<PageResult<VehicleRow>> {
    const { page, limit, offset } = this.pagination(query);
    const search = `%${query.search?.trim() ?? ''}%`;

    const where = `
        WHERE (
          "licensePlate" ILIKE $1
          OR COALESCE(brand, '') ILIKE $1
          OR COALESCE(model, '') ILIKE $1
          OR COALESCE("chassisNumber", '') ILIKE $1
          OR "customerName" ILIKE $1
        )
      `;

    const countRows = (await this.db.query(
      `SELECT COUNT(*)::int AS total
         FROM (${this.vehicleDirectorySql}) directory
         ${where}`,
      [search],
    )) as Array<{ total: number }>;

    const data = (await this.db.query(
      `SELECT *
         FROM (${this.vehicleDirectorySql}) directory
         ${where}
         ORDER BY "lastBookingAt" DESC, id
         LIMIT $2 OFFSET $3`,
      [search, limit, offset],
    )) as VehicleRow[];

    return {
      data,
      total: Number(countRows[0]?.total ?? 0),
      page,
      limit,
    };
  }

  async vehicleDetail(plate: string) {
    const normalized = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');

    const rows = (await this.db.query(
      `SELECT *
         FROM (${this.vehicleDirectorySql}) directory
         WHERE id = $1`,
      [normalized],
    )) as VehicleRow[];

    if (!rows.length) {
      throw new NotFoundException('Không tìm thấy phương tiện');
    }

    const history = (await this.db.query(
      `${this.historySql}
         WHERE UPPER(regexp_replace(
           b.license_plate, '[^A-Za-z0-9]', '', 'g'
         )) = $1
         ORDER BY b.created_at DESC, b.id DESC`,
      [normalized],
    )) as HistoryRow[];

    const contacts = new Map<
      string,
      {
        phone: string;
        fullName: string;
        bookingCount: number;
      }
    >();

    for (const row of history) {
      const phone = row.customerPhone.replace(/\D/g, '');
      const existing = contacts.get(phone);

      if (existing) {
        existing.bookingCount += 1;
      } else {
        contacts.set(phone, {
          phone,
          fullName: row.customerName,
          bookingCount: 1,
        });
      }
    }

    return {
      vehicle: rows[0],
      contacts: [...contacts.values()],
      history,
    };
  }
}
