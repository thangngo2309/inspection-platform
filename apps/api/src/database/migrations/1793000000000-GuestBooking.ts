import { MigrationInterface, QueryRunner } from 'typeorm';

export class GuestBooking1793000000000 implements MigrationInterface {
  name = 'GuestBooking1793000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE bookings
        ALTER COLUMN customer_id DROP NOT NULL
      `);

    await queryRunner.query(`
        ALTER TABLE bookings
        ALTER COLUMN vehicle_id DROP NOT NULL
      `);

    await queryRunner.query(`
        ALTER TABLE bookings
        ADD COLUMN vehicle_snapshot JSONB
      `);

    await queryRunner.query(`
        ALTER TABLE booking_status_histories
        ALTER COLUMN actor_user_id DROP NOT NULL
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const rows = (await queryRunner.query(`
        SELECT COUNT(*)::int AS count
        FROM bookings
        WHERE customer_id IS NULL
           OR vehicle_id IS NULL
      `)) as Array<{ count: number }>;

    if (Number(rows[0]?.count ?? 0) > 0) {
      throw new Error(
        'Không thể rollback khi còn Guest Booking chưa liên kết Customer và Vehicle',
      );
    }

    await queryRunner.query(`
        ALTER TABLE booking_status_histories
        ALTER COLUMN actor_user_id SET NOT NULL
      `);

    await queryRunner.query(`
        ALTER TABLE bookings
        DROP COLUMN vehicle_snapshot
      `);

    await queryRunner.query(`
        ALTER TABLE bookings
        ALTER COLUMN vehicle_id SET NOT NULL
      `);

    await queryRunner.query(`
        ALTER TABLE bookings
        ALTER COLUMN customer_id SET NOT NULL
      `);
  }
}
