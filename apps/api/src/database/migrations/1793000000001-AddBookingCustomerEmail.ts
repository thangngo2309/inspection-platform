import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBookingCustomerEmail1793000000001 implements MigrationInterface {
  name = 'AddBookingCustomerEmail1793000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE public.bookings
        ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255)
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE public.bookings
        DROP COLUMN IF EXISTS customer_email
      `);
  }
}
