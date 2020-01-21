import { HttpException } from '@nestjs/common';

export class ControllerException extends HttpException {
  constructor() {
    super('Controller Error', 400);
  }
  message = 'Im the controller exception';
}
