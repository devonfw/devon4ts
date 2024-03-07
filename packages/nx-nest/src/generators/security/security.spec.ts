import { Tree, readProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import applicationGenerator from '../application/application';
import { SecurityGeneratorSchema } from './schema';
import { securityGenerator } from './security';

describe('Security Generator', () => {
  let tree: Tree;
  const options: SecurityGeneratorSchema = { projectName: 'test' };

  beforeAll(async () => {
    tree = createTreeWithEmptyWorkspace();
    await applicationGenerator(tree, {
      name: options.projectName,
      projectNameAndRootFormat: 'as-provided',
      directory: 'apps/test',
    });
    await securityGenerator(tree, options);
  }, 60000);

  it('should run successfully', async () => {
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });

  it('should add dependencies to package.json', async () => {
    const fileContent = tree.read('package.json')?.toString('utf-8');
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"helmet":/g);
  });

  it('should add CORS and helmet to main.ts', async () => {
    const fileContent = tree.read(`./packages/nx-nest/apps/${options.projectName}/src/main.ts`)?.toString('utf-8');
    expect(fileContent).toMatchSnapshot();
  });
});
