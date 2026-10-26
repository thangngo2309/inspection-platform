import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from './roles.guard.js';
import { UserRole } from './auth.types.js';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
