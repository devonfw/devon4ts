import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';
import { securityGenerator } from './generator';
import { SecurityGeneratorSchema } from './schema';
import applicationGenerator from '../application/generator';

describe('Security Generator', () => {
  let tree: Tree;
  const options: SecurityGeneratorSchema = { projectName: 'test' };

  beforeAll(async () => {
    tree = createTreeWithEmptyWorkspace();
    await applicationGenerator(tree, options);
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
    const fileContent = tree.read(`./apps/${options.projectName}/src/main.ts`)?.toString('utf-8');
    expect(fileContent).toContain('app.enableCors');
    expect(fileContent).toContain(`import helmet from 'helmet'`);
  });
});
