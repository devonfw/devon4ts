import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ControllerGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    console.log('Im controller guard');
    return true;
  }
}
