import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User, UserRole } from '../../user/models';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly _reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this._reflector.get<UserRole[]>(
      'roles',
      context.getHandler(),
    );

    if (!roles || roles.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    const hasRole = UserRole[user.role] !== undefined;

    if (user && user.role && hasRole) {
      return true;
    }

    throw new HttpException(
      'You do not have permission to proceed',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
