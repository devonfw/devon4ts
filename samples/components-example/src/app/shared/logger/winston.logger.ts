/* istanbul ignore file */
import { Logger, LogLevel } from '@nestjs/common';
import { join } from 'path';
import * as winston from 'winston';

export class WinstonLogger extends Logger {
  private static DEFAULT_LOG_LEVEL: 'info' | 'error' | 'warn' | 'http' | 'verbose' | 'debug' | 'silly' = 'info';
  private console = true;
  private logger?: winston.Logger;

  constructor() {
    super();
    const logLevel = WinstonLogger.DEFAULT_LOG_LEVEL;

    this.overrideLogger(WinstonLogger.DEFAULT_LOG_LEVEL);

    this.logger = winston.createLogger({
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      level: logLevel,
      transports: [
        new winston.transports.File({
          filename: join(__dirname, '../../../../logs/default.log'),
        }),
        new winston.transports.File({
          filename: join(__dirname, '../../../../logs/error.log'),
          level: 'error',
        }),
      ],
    });
  }

  overrideLogger(level: 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly'): void {
    const loggerLevels: LogLevel[] = ['debug', 'verbose', 'log', 'warn', 'error'];
    let nestLoggerLevel: string = level;

    if (nestLoggerLevel === 'info' || nestLoggerLevel === 'http') {
      nestLoggerLevel = 'log';
    }

    if (nestLoggerLevel === 'silly') {
      nestLoggerLevel = 'debug';
    }

    const pos = loggerLevels.findIndex(e => e === nestLoggerLevel);

    if (pos !== -1) {
      Logger.overrideLogger(loggerLevels.slice(pos));
    }
  }

  log(message: string, context?: string): void {
    if (this.console) {
      super.log(message, context);
    }
    if (this.logger) {
      this.logger.info({ message, context });
    }
  }

  error(message: string, trace: string, context?: string): void {
    if (this.console) {
      super.error(message, trace, context);
    }
    if (this.logger) {
      this.logger.error({ message, trace, context });
    }
  }

  warn(message: string, context?: string): void {
    if (this.console) {
      super.warn(message, context);
    }
    if (this.logger) {
      this.logger.warn({ message, context });
    }
  }

  debug(message: any, context?: string): void {
    if (this.console) {
      super.debug(message, context);
    }
    if (this.logger) {
      this.logger.debug({ message, context });
    }
  }

  verbose(message: any, context?: string): void {
    if (this.console) {
      super.verbose(message, context);
    }
    if (this.logger) {
      this.logger.verbose({ message, context });
    }
  }
}
