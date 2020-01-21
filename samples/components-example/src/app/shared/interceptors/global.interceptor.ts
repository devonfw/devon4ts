import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class GlobalInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Im global interceptor before');
    return next.handle().pipe(
      tap(() => {
        console.log('Im global interceptor after');
      }),
    );
  }
}
