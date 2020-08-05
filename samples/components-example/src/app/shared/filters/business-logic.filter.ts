import { ArgumentsHost, Catch, ExceptionFilter, Optional } from '@nestjs/common';
import { BusinessLogicException } from '~app/shared/exceptions/business-logic.exception';
import { WinstonLogger } from '~app/shared/logger/winston.logger';
import { Response } from 'express';

@Catch(BusinessLogicException)
export class BusinessLogicFilter<T extends BusinessLogicException> implements ExceptionFilter {
  constructor(@Optional() public readonly logger?: WinstonLogger) { }

  catch(exception: T, host: ArgumentsHost): void {
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
