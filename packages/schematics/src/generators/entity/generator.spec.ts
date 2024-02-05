import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { entityGenerator } from './generator';
import { EntityGeneratorSchema } from './schema';
import { pluralize } from '../../utils';

describe('entity generator', () => {
  let tree: Tree;
  const options: EntityGeneratorSchema = { name: 'test', projectName: 'test' };

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    await entityGenerator(tree, options);
  });

  it('should run successfully', async () => {
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });

  it('should add dependencies to package.json', async () => {
    const fileContent = tree.read('package.json')?.toString('utf-8');
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"typeorm":/g);
  });

  it('should create a new entity file', async () => {
    const projectRoot = `apps/${options.projectName}/src/app/${pluralize(options.name)}/entities/${
      options.name
    }.entity.ts`;
    const fileContent = tree.read(projectRoot)?.toString('utf-8');
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"typeorm":/g);
  });
});
