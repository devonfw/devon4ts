import { Logger } from '@nestjs/common';
import { join } from 'path';
import * as winston from 'winston';

export class WinstonLogger extends Logger {
  logger: winston.Logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD hh:mm:ss A ZZ',
      }),
      winston.format.json(),
    ),
    level: 'info',
    transports: [
      new winston.transports.File({
        filename: join(__dirname, '../../../', '/logs/error.log'),
        level: 'error',
      }),
      new winston.transports.File({
        filename: join(__dirname, '../../../', '/logs/general.log'),
      }),
    ],
  });

  log(message: any, _context?: string): any {
    this.logger.info(message);
    super.log(message);
  }

  error(message: string, trace: string) {
    this.logger.error(message + trace);
    super.error(message, trace);
  }

  warn(message: string) {
    this.logger.warn(message);
    super.warn(message);
  }
}
