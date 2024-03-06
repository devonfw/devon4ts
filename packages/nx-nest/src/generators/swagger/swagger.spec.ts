import { Tree, readProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { ApplicationGeneratorOptions } from '@nx/nest/src/generators/application/schema';
import applicationGenerator from '../application/application';
import convictGenerator from '../convict/convict';
import { swaggerGenerator } from './swagger';

describe('swagger generator', () => {
  let tree: Tree;
  const options: ApplicationGeneratorOptions = {
    name: 'test',
    projectNameAndRootFormat: 'as-provided',
    directory: 'apps/test',
  };

  beforeAll(async () => {
    tree = createTreeWithEmptyWorkspace();
    await applicationGenerator(tree, options);
  }, 60000);

  it('should run successfully', async () => {
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });

  describe('common swagger generator tasks', () => {
    beforeAll(async () => {
      await swaggerGenerator(tree, { projectName: options.name });
    }, 60000);

    it('should add dependencies to package.json', async () => {
      const fileContent = tree.read('package.json')?.toString('utf-8');
      expect(fileContent).toMatch(/"dependencies": {(.|\n)*"@nestjs\/swagger":/g);
    });

    it('should add Swagger configuration to main.ts', async () => {
      const fileContent = tree.read(`./packages/nx-nest/apps/${options.name}/src/main.ts`)?.toString('utf-8');
      expect(fileContent).toMatchSnapshot();
    });

    it('should not have BaseEntity model', async () => {
      const filePath = `./packages/schematcis/apps/${options.name}/src/app/shared/model/entities/base.entity.ts`;
      expect(tree.exists(filePath)).toBeFalsy();
    });

    it('should not have config.ts', async () => {
      const filePath = `./packages/schematcis/apps/${options.name}/src/config.ts`;
      expect(tree.exists(filePath)).toBeFalsy();
    });
  });

  describe('swagger generator with convict', () => {
    beforeAll(async () => {
      await convictGenerator(tree, { projectName: options.name });
      await swaggerGenerator(tree, { projectName: options.name });
    }, 60000);

    it('should add Swagger properties to config.ts', async () => {
      const filePath = `./packages/nx-nest/apps/${options.name}/src/config.ts`;
      const fileContent = tree.read(filePath)?.toString('utf-8');
      expect(fileContent).toMatchSnapshot();
    });

    it('should add Swagger types at app-config', async () => {
      const filePath = `./packages/nx-nest/apps/${options.name}/src/app/app-config.ts`;
      const fileContent = tree.read(filePath)?.toString('utf-8');
      expect(fileContent).toMatchSnapshot();
    });
  });
});
