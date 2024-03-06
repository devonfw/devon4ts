import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rol =
      this.reflector.get<number[]>('roles', context.getHandler()) ||
      this.reflector.get<number[]>('roles', context.getClass());
    if (!rol) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const hasRole = (): boolean => rol.includes(user.role);

    return user !== undefined && user.role !== undefined && hasRole();
  }
}
