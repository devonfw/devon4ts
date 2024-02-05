import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';
import { middlewareGenerator } from './generator';
import { MiddlewareGeneratorSchema } from './schema';

describe('middleware generator', () => {
  let tree: Tree;
  const options: MiddlewareGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await middlewareGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});
