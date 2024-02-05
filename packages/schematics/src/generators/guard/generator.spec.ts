import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';
import { guardGenerator } from './generator';
import { GuardGeneratorSchema } from './schema';

describe('guard generator', () => {
  let tree: Tree;
  const options: GuardGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await guardGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});
