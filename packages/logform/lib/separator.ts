import { Format, TransformableInfo } from 'logform';
import { MESSAGE } from 'triple-beam';

class SeparatorFormatter implements Format {
  transform(info: TransformableInfo): TransformableInfo {
    const level = info.level,
      timestamp = this.separate(info.timestamp),
      context = this.separate(info.context ?? 'main'),
      message = this.separate(info.message),
      pid = this.separate(info.pid),
      stack = this.separate(info.stack);

    let extras = '';

    if (info.extras && info.extras.length) {
      extras = info.extras
        .map((extra: string) => this.separate(extra))
        .reduce((prev: string, curr: string) => prev + curr, '');
    }

    info[MESSAGE] = `${level}${timestamp}${pid}${context}${message}${extras}${stack}`;
    return info;
  }

  private separate(text: string): string {
    return text ? ` | ${text}` : '';
  }
}

/**
 * separator is a custom wiston format. This format will print all
 * data seperated by "|".
 *
 * The order of the data will be:
 *   1. the log level
 *   2. (if present) the log timestamp
 *   3. (if present) the PID
 *   4. the log context (the class or file that originate the log entry)
 *   5. the log message
 *   6. (if present) the extra values
 *   7. (if present) the stack trace
 *
 * This is a format finalizer, that means it must be the last element
 * of you combine chain.
 *
 * @example
 * info | 2022-08-09T21:04:45.764Z | 19493 | NestApplication | Nest application successfully started
 *
 *
 * @returns a new separator instance
 */
export const separator = (): Format => new SeparatorFormatter();
