import { ArgumentsHost, Catch, ExceptionFilter, Optional } from '@nestjs/common';
import { LogicException } from '~app/shared/exceptions/logic.exception';
import { WinstonLogger } from '~app/shared/logger/winston.logger';
import { Response } from 'express';

@Catch(LogicException)
export class LogicFilter<T extends LogicException> implements ExceptionFilter {
  constructor(@Optional() public readonly logger?: WinstonLogger) { }

  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const responseObj = {
      ...exception.plainObject(),
      statusCode: 400,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (this.logger) {
      this.logger.error(exception.message, exception.stack!, 'LogicFilter');
    }

    response.status(400).json(responseObj);
  }
}
