import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class GlobalMiddlewareMiddleware implements NestMiddleware {
  use(_req: any, _res: any, next: () => void) {
    console.log('Im global middleware');
    next();
    console.log('Im global middleware again');
  }
}
