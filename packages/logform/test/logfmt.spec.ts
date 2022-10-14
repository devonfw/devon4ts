import { logfmt } from '../lib';
import { MESSAGE } from 'triple-beam';

describe('logfmt', () => {
  it('should format the log message by using logfmt', () => {
    const input = {
      pid: 1234,
      level: 'info',
      message: 'message',
      timestamp: '2022',
      context: 'MyApp',
    };
    const expected = 'pid=1234 level=info message=message timestamp=2022 context=MyApp';

    expect(logfmt().transform(input)[MESSAGE]).toStrictEqual(expected);
  });

  it('should use "main" as context if not present', () => {
    const input = {
      level: 'info',
      message: 'message',
    };
    const expected = 'level=info message=message context=main';

    expect(logfmt().transform(input)[MESSAGE]).toStrictEqual(expected);
  });

  it('should not print the extras if an empty array is provided', () => {
    const input = {
      level: 'info',
      message: 'message',
      extras: [],
    };
    const expected = 'level=info message=message context=main';

    expect(logfmt().transform(input)[MESSAGE]).toStrictEqual(expected);
  });
});
