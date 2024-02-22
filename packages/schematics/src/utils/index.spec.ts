import { classify } from './index';

describe('class names generator', () => {
  const name = 'test';
  it('should return the name as a class name', () => {
    const className = 'Test';
    expect(classify).toBeDefined();
    expect(classify(name)).toBe(className);
  });
});
