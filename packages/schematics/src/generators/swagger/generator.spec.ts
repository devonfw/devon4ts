import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';
import { swaggerGenerator } from './generator';
import { SwaggerGeneratorSchema } from './schema';
import applicationGenerator from '../application/generator';
import initTypeormGenerator from '../init-typeorm/generator';
import convictGenerator from '../convict/generator';

describe('swagger generator', () => {
  let tree: Tree;
  const options: SwaggerGeneratorSchema = { projectName: 'test' };

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
      await swaggerGenerator(tree, options);
    }, 60000);

    it('should add dependencies to package.json', async () => {
      const fileContent = tree.read('package.json')?.toString('utf-8');
      expect(fileContent).toMatch(/"dependencies": {(.|\n)*"@nestjs\/swagger":/g);
    });

    it('should add Swagger configuration to main.ts', async () => {
      const fileContent = tree.read(`./apps/${options.projectName}/src/main.ts`)?.toString('utf-8');
      expect(fileContent).toContain('SwaggerModule.setup');
    });

    it('should not have BaseEntity model', async () => {
      const filePath = `./apps/${options.projectName}/src/app/shared/model/entities/base.entity.ts`;
      expect(tree.exists(filePath)).toBeFalsy();
    });

    it('should not have config.ts', async () => {
      const filePath = `./apps/${options.projectName}/src/config.ts`;
      expect(tree.exists(filePath)).toBeFalsy();
    });
  });

  describe('swagger generator with init-typeorm', () => {
    beforeAll(async () => {
      await initTypeormGenerator(tree, { ...options, db: 'mysql' });
      await swaggerGenerator(tree, options);
    }, 60000);

    it('should update BaseEntity.ts configuration', async () => {
      const filePath = `./apps/${options.projectName}/src/app/shared/model/entities/base.entity.ts`;
      const fileContent = tree.read(filePath)?.toString('utf-8');
      expect(fileContent).toContain('ApiHideProperty');
      expect(fileContent).toContain('@nestjs/swagger');
    });
  });

  describe('swagger generator with convict', () => {
    beforeAll(async () => {
      await convictGenerator(tree, options);
      await swaggerGenerator(tree, options);
    }, 60000);

    it('should add Swagger properties to config.ts', async () => {
      const filePath = `./apps/${options.projectName}/src/config.ts`;
      const fileContent = tree.read(filePath)?.toString('utf-8');
      expect(fileContent).toContain('swagger');
    });
  });
});
