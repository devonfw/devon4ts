import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class GlobalMiddlewareMiddleware implements NestMiddleware {
  use(_req: any, _res: any, next: () => void): void {
    console.log('Im global middleware');
    next();
    console.log('Im global middleware after');
  }
}
