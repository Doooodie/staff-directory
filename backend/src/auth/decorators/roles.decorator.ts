import { SetMetadata } from '@nestjs/common';

import type { UserRoleLevel } from '../entities/user.entity.js';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRoleLevel[]) =>
  SetMetadata(ROLES_KEY, roles);
