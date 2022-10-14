import { pid } from '../lib';
describe('pid', () => {
  it('should add the pid to the info object', () => {
    const input = { level: 'info', message: 'message' };
    const expected = { ...input, pid: process.pid };

    expect(pid().transform(input)).toStrictEqual(expected);
  });
});
