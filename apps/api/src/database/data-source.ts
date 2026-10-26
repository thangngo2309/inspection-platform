import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { InitialInspectionSchema1761400000000 } from './migrations/1761400000000-InitialInspectionSchema.js';
import { BUSINESS_ENTITIES } from '../business/business-entities.js';
import { BookingStaffCapacity1761410000000 } from './migrations/1761410000000-BookingStaffCapacity.js';
import { GuestBooking1793000000000 } from './migrations/1793000000000-GuestBooking.js';
import { AddBookingCustomerEmail1793000000001 } from './migrations/1793000000001-AddBookingCustomerEmail.js';

const currentDir = fileURLToPath(new URL('.', import.meta.url));
const rootDir = resolve(currentDir, '../../../../');

loadEnv({ path: resolve(rootDir, '.env') });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? '9003'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [...BUSINESS_ENTITIES],
  migrations: [
    InitialInspectionSchema1761400000000,
    BookingStaffCapacity1761410000000,
    GuestBooking1793000000000,
    AddBookingCustomerEmail1793000000001,
  ],
  synchronize: false,
  migrationsRun: false,
  logging: ['error', 'warn'],
});
