import { blue, ChalkFunction, cyan, green, grey, red, white, yellow } from 'chalk';
import { Format, TransformableInfo } from 'logform';

export interface ColorizeFormatterOptions {
  enabled?: boolean;
}

class ColorizeFormatter implements Format {
  constructor(private opts: ColorizeFormatterOptions) {}

  transform(info: TransformableInfo): TransformableInfo | boolean {
    if (!this.opts.enabled) {
      return info;
    }

    info.level = this.getLevelColor(info.level)(info.level);

    if (info['context']) {
      info['context'] = yellow(info['context']);
    }

    if (info['pid']) {
      info['pid'] = grey(info['pid']);
    }

    if (info['stack']) {
      info['stack'] = red(info['stack']);
    }

    return info;
  }

  private getLevelColor(level: string): ChalkFunction {
    switch (level) {
      case 'info':
        return green;
      case 'error':
        return red;
      case 'warn':
        return yellow;
      case 'debug':
        return blue;
      case 'verbose':
        return cyan;
      default:
        return white;
    }
  }
}

export const colorize = (enabled?: boolean): Format => new ColorizeFormatter({ enabled: enabled ?? true });
