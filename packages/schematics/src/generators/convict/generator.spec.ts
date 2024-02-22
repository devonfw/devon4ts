import { Tree, readProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { ApplicationGeneratorOptions } from '@nx/nest/src/generators/application/schema';
import applicationGenerator from '../application/generator';
import { convictGenerator } from './generator';

describe('convict generator', () => {
  let tree: Tree;
  const options: ApplicationGeneratorOptions = {
    name: 'test',
    projectNameAndRootFormat: 'as-provided',
    directory: 'apps/test',
  };

  beforeAll(async () => {
    tree = createTreeWithEmptyWorkspace();
    await applicationGenerator(tree, options);
    await convictGenerator(tree, { projectName: options.name });
    jest.clearAllMocks();
  }, 60000);

  it('should run successfully', async () => {
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });

  it('should add dependencies to package.json', async () => {
    const fileContent = tree.read('package.json')?.toString('utf-8');
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"convict":/g);
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"@types\/convict":/g);
  });

  it('should add convict configuration to main.ts', async () => {
    const fileContent = tree.read(`./packages/schematics/apps/${options.name}/src/main.ts`)?.toString('utf-8');
    expect(fileContent).toContain(`import config from './config'`);
    expect(fileContent).toContain('await app.listen(port);');
  });

  it('should update winston configuration', async () => {
    const filePath = `./packages/schematics/apps/${options.name}/src/app/shared/logger/winston.logger.ts`;
    if (tree.exists(filePath)) {
      const fileContent = tree.read(filePath)?.toString('utf-8');
      expect(fileContent).toContain('level: config.logger.loggerLevel');
    } else {
      expect(tree.exists(filePath)).toBeFalsy();
    }
  });
});
