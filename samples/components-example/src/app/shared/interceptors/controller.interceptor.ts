import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ControllerInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Im controller interceptor before');
    return next.handle().pipe(
      tap(() => {
        console.log('Im controller interceptor after');
      }),
    );
  }
}
