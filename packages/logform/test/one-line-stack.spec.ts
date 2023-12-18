import { oneLineStack } from '../lib';
describe('oneLineStack', () => {
  it('should remove all new lines from stack', () => {
    const input = { level: 'info', message: 'error message', stack: 'error \n at main.ts' };
    const expected = { level: 'info', message: 'error message', stack: 'error  \\  at main.ts' };

    expect(oneLineStack().transform(input)).toStrictEqual(expected);
  });

  it('should do nothing if not stack is provided', () => {
    const input = { level: 'info', message: 'error message' };

    expect(oneLineStack().transform(input)).toStrictEqual(input);
  });

  it('should do nothing if not enabled', () => {
    const input = { level: 'info', message: 'error message', stack: 'error \n at main.ts' };

    expect(oneLineStack(false).transform(input)).toStrictEqual(input);
  });
});
