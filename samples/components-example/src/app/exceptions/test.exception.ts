import { HttpException } from '@nestjs/common';

export class TestException extends HttpException {
  constructor() {
    super('Test Error', 400);
  }
  message = 'Im the test exception';
}
