import { Tree, readProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { ApplicationGeneratorOptions } from '@nx/nest/src/generators/application/schema';
import applicationGenerator from '../application/generator';
import convictGenerator from '../convict/generator';
import initTypeormGenerator from '../init-typeorm/generator';
import { swaggerGenerator } from './generator';

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
      const fileContent = tree.read(`./packages/schematics/apps/${options.name}/src/main.ts`)?.toString('utf-8');
      expect(fileContent).toContain('SwaggerModule.setup');
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

  describe('swagger generator with init-typeorm', () => {
    beforeAll(async () => {
      await initTypeormGenerator(tree, { projectName: options.name, db: 'mysql' });
      await swaggerGenerator(tree, { projectName: options.name });
    }, 60000);

    it('should update BaseEntity.ts configuration', async () => {
      const filePath = `./packages/schematics/apps/${options.name}/src/app/shared/model/entities/base.entity.ts`;
      const fileContent = tree.read(filePath)?.toString('utf-8');
      expect(fileContent).toContain('ApiHideProperty');
      expect(fileContent).toContain('@nestjs/swagger');
    });
  });

  describe('swagger generator with convict', () => {
    beforeAll(async () => {
      await convictGenerator(tree, { projectName: options.name });
      await swaggerGenerator(tree, { projectName: options.name });
    }, 60000);

    it('should add Swagger properties to config.ts', async () => {
      const filePath = `./packages/schematics/apps/${options.name}/src/config.ts`;
      const fileContent = tree.read(filePath)?.toString('utf-8');
      expect(fileContent).toContain('swagger');
    });
  });
});
