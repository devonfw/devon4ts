import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { initTypeormGenerator } from './generator';
import { InitTypeormGeneratorSchema } from './schema';

describe('init-typeorm generator', () => {
  let tree: Tree;
  const options: InitTypeormGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await initTypeormGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});
