import { Format, TransformableInfo } from 'logform';

export interface OneLineStackOptions {
  enabled?: boolean;
}

class OneLineStackFormatter implements Format {
  constructor(private opts: OneLineStackOptions) {}

  transform(info: TransformableInfo): TransformableInfo | boolean {
    if (!this.opts.enabled) {
      return info;
    }

    if (info['stack']) {
      info['stack'] = info['stack'].replace(/[\r\n]/gm, ' \\ ');
    }

    return info;
  }
}

export const oneLineStack = (enabled?: boolean): Format => new OneLineStackFormatter({ enabled: enabled ?? true });
