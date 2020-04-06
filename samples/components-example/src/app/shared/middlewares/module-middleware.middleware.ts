import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class ModuleMiddleware implements NestMiddleware {
  use(_req: any, _res: any, next: () => void): void {
    console.log('Im module middleware');
    next();
    console.log('Im module middleware after');
  }
}
