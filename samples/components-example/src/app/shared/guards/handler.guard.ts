import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class HandlerGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    console.log('Im handler guard');
    return true;
  }
}
