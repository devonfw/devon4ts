import { ReflectMetadata } from '@nestjs/common';
import { UserRole } from '../../user/models';

export const Roles = (...roles: UserRole[]) => ReflectMetadata('roles', roles);
