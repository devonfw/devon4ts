import { blue, cyan, green, grey, red, white, yellow } from 'chalk';
import { colorize } from '../lib';

describe('colorize', () => {
  it('should apply colors to the log object', () => {
    const input = {
      level: 'info',
      message: 'message',
      context: 'MyApp',
    };
    const expected = {
      level: green('info'),
      message: 'message',
      context: yellow('MyApp'),
    };

    expect(colorize().transform(input)).toStrictEqual(expected);
  });

  it('should do nothing if not enabled', () => {
    const input = {
      level: 'info',
      message: 'message',
      context: 'MyApp',
    };

    expect(colorize(false).transform(input)).toStrictEqual(input);
  });

  it('should apply diferent colors depending on log level', () => {
    expect(colorize().transform({ level: 'debug', message: '' })).toStrictEqual({ level: blue('debug'), message: '' });
    expect(colorize().transform({ level: 'verbose', message: '' })).toStrictEqual({
      level: cyan('verbose'),
      message: '',
    });
    expect(colorize().transform({ level: 'warn', message: '' })).toStrictEqual({
      level: yellow('warn'),
      message: '',
    });
    expect(colorize().transform({ level: 'error', message: '' })).toStrictEqual({
      level: red('error'),
      message: '',
    });
    expect(colorize().transform({ level: 'info', message: '' })).toStrictEqual({
      level: green('info'),
      message: '',
    });
    expect(colorize().transform({ level: 'other', message: '' })).toStrictEqual({
      level: white('other'),
      message: '',
    });
  });

  it('should colorize the pid if present', () => {
    const input = {
      level: 'info',
      message: 'message',
      context: 'MyApp',
      pid: 1234,
    };
    const expected = {
      level: green('info'),
      message: 'message',
      context: yellow('MyApp'),
      pid: grey(1234),
    };

    expect(colorize().transform(input)).toStrictEqual(expected);
  });

  it('should colorize the stack if present', () => {
    const input = {
      level: 'info',
      message: 'message',
      context: 'MyApp',
      stack: 'this is the stack trace',
    };
    const expected = {
      level: green('info'),
      message: 'message',
      context: yellow('MyApp'),
      stack: red('this is the stack trace'),
    };

    expect(colorize().transform(input)).toStrictEqual(expected);
  });
});
