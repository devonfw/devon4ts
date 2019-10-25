import { HttpException } from '@nestjs/common';

export class GlobalException extends HttpException {
  constructor() {
    super('Global Error', 400);
  }
  message = 'Im the global exception';
}
