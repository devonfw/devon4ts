import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';
import { interceptorGenerator } from './generator';
import { InterceptorGeneratorSchema } from './schema';

describe('interceptor generator', () => {
  let tree: Tree;
  const options: InterceptorGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await interceptorGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});
