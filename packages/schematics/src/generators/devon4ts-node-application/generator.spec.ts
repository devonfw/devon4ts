import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { devon4tsNodeApplicationGenerator } from './generator';
import { Devon4tsNodeApplicationGeneratorSchema } from './schema';

describe('devon4ts_node-application generator', () => {
  let tree: Tree;
  const options: Devon4tsNodeApplicationGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await devon4tsNodeApplicationGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});
