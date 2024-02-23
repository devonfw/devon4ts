import { stringify } from 'logfmt';
import { Format, TransformableInfo } from 'logform';
import { LEVEL, MESSAGE } from 'triple-beam';

class LogFmtFormatter implements Format {
  transform(info: TransformableInfo): TransformableInfo {
    const infoCopy = { ...info };
    delete infoCopy[MESSAGE];
    delete infoCopy[LEVEL];

    if (!infoCopy['context']) {
      infoCopy['context'] = 'main';
    }

    if (!infoCopy['extras']?.length) {
      delete infoCopy['extras'];
    }

    info[MESSAGE] = stringify(infoCopy);
    return info;
  }
}

export const logfmt = (): Format => new LogFmtFormatter();
