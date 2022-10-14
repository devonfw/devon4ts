import { separator } from '../lib';
import { MESSAGE } from 'triple-beam';

describe('separator', () => {
  it('should format the log message by using |', () => {
    const input = {
      level: 'info',
      message: 'message',
      context: 'MyApp',
      pid: 1234,
      timestamp: '2022-08-09T10:00:00.000Z',
    };
    const expectedInfo = 'info | 2022-08-09T10:00:00.000Z | 1234 | MyApp | message';

    expect(separator().transform(input)[MESSAGE]).toStrictEqual(expectedInfo);
  });

  it('should use "main" as context if no context is provided', () => {
    const input = {
      level: 'info',
      message: 'message',
      pid: 1234,
      timestamp: '2022-08-09T10:00:00.000Z',
    };
    const expectedInfo = 'info | 2022-08-09T10:00:00.000Z | 1234 | main | message';

    expect(separator().transform(input)[MESSAGE]).toStrictEqual(expectedInfo);
  });

  it('should include the extras', () => {
    const input = {
      level: 'info',
      message: 'message',
      context: 'MyApp',
      pid: 1234,
      extras: ['extra 1', 'extra 2'],
      timestamp: '2022-08-09T10:00:00.000Z',
    };
    const expectedInfo = 'info | 2022-08-09T10:00:00.000Z | 1234 | MyApp | message | extra 1 | extra 2';

    expect(separator().transform(input)[MESSAGE]).toStrictEqual(expectedInfo);
  });

  it('should skip the extras if an empty array is provided', () => {
    const input = {
      level: 'info',
      message: 'message',
      context: 'MyApp',
      pid: 1234,
      extras: [],
      timestamp: '2022-08-09T10:00:00.000Z',
    };
    const expectedInfo = 'info | 2022-08-09T10:00:00.000Z | 1234 | MyApp | message';

    expect(separator().transform(input)[MESSAGE]).toStrictEqual(expectedInfo);
  });

  it('should include the stack trace', () => {
    const input = {
      level: 'info',
      message: 'message',
      context: 'MyApp',
      pid: 1234,
      stack: 'this is the provided stack trace',
      timestamp: '2022-08-09T10:00:00.000Z',
    };
    const expectedInfo = 'info | 2022-08-09T10:00:00.000Z | 1234 | MyApp | message | this is the provided stack trace';

    expect(separator().transform(input)[MESSAGE]).toStrictEqual(expectedInfo);
  });
});
