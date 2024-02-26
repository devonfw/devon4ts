import { Tree, readProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import applicationGenerator from '../application/generator';
import { entityGenerator } from './generator';
import { EntityGeneratorSchema } from './schema';

describe('entity generator', () => {
  let tree: Tree;
  const options: EntityGeneratorSchema = { name: 'test', projectName: 'test' };
  const plural = jest.fn(() => 'tests');

  beforeAll(async () => {
    tree = createTreeWithEmptyWorkspace();
    await applicationGenerator(tree, {
      name: options.name,
      projectNameAndRootFormat: 'as-provided',
      directory: 'apps/test',
    });
    await entityGenerator(tree, options);
  }, 60000);

  it('should run successfully', async () => {
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });

  it('should add dependencies to package.json', async () => {
    const fileContent = tree.read('package.json')?.toString('utf-8');
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"typeorm":/g);
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"@nestjs\/typeorm":/g);
  });

  it('should create a new entity file', async () => {
    const projectRoot = `packages/schematics/apps/${options.name}/src/app/${plural()}/entities/${
      options.name
    }.entity.ts`;
    expect(tree.exists(projectRoot)).toBeTruthy();
  });
});
