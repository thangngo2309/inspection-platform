import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hash } from 'bcryptjs';

import dataSource from './data-source.js';
import { User } from '../business/entities/inspection.entities.js';
import { UserRole } from '../business/auth/auth.types.js';

const currentDir = fileURLToPath(new URL('.', import.meta.url));

loadEnv({
  path: resolve(currentDir, '../../../../.env'),
});

async function seedSuperAdmin() {
  const phone = process.env.SUPER_ADMIN_PHONE?.trim();
  const fullName =
    process.env.SUPER_ADMIN_FULL_NAME?.trim() || 'Super Administrator';
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!phone || !/^0\d{9}$/.test(phone)) {
    throw new Error('SUPER_ADMIN_PHONE không hợp lệ');
  }

  if (!password || password.length < 12) {
    throw new Error('SUPER_ADMIN_PASSWORD phải có ít nhất 12 ký tự');
  }

  await dataSource.initialize();

  try {
    const repo = dataSource.getRepository(User);
    const existing = await repo.findOneBy({ phone });

    if (existing) {
      if (existing.role !== UserRole.SUPER_ADMIN) {
        throw new Error(
          'Số điện thoại đã thuộc một tài khoản khác. Không tự nâng quyền.',
        );
      }

      console.log('Super Admin đã tồn tại. Bỏ qua seed.');
      return;
    }

    const passwordHash = await hash(password, 12);

    await repo.save(
      repo.create({
        phone,
        fullName,
        email: null,
        passwordHash,
        role: UserRole.SUPER_ADMIN,
        status: 'active',
        lastLoginAt: null,
      }),
    );

    console.log('Tạo tài khoản Super Admin thành công.');
    console.log(`Số điện thoại: ${phone}`);
  } finally {
    await dataSource.destroy();
  }
}

seedSuperAdmin().catch((error: unknown) => {
  console.error('Seed Super Admin thất bại:', error);
  process.exitCode = 1;
});
