import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';
import { swaggerGenerator } from './generator';
import { SwaggerGeneratorSchema } from './schema';
import applicationGenerator from '../application/generator';

describe('swagger generator', () => {
  let tree: Tree;
  const options: SwaggerGeneratorSchema = { projectName: 'test' };

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    await applicationGenerator(tree, options);
    await swaggerGenerator(tree, options);
  }, 15000);

  it('should run successfully', async () => {
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });

  it('should add dependencies to package.json', async () => {
    const fileContent = tree.read('package.json')?.toString('utf-8');
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"@nestjs\/swagger":/g);
  });

  it('should add Swagger properties to config.ts', async () => {
    const filePath = `./apps/${options.projectName}/src/config.ts`;
    if (tree.exists(filePath)) {
      const fileContent = tree.read(filePath)?.toString('utf-8');
      expect(fileContent).toContain('swagger');
    } else {
      expect(tree.exists(filePath)).toBeFalsy();
    }
  });

  it('should add Swagger configuration to main.ts', async () => {
    const fileContent = tree.read(`./apps/${options.projectName}/src/main.ts`)?.toString('utf-8');
    expect(fileContent).toContain('SwaggerModule.setup');
  });

  it('should update BaseEntity.ts configuration', async () => {
    const filePath = `./apps/${options.projectName}/src/app/shared/model/entities/base.entity.ts`;
    if (tree.exists(filePath)) {
      const fileContent = tree.read(filePath)?.toString('utf-8');
      expect(fileContent).toContain('ApiHideProperty');
      expect(fileContent).toContain('@nestjs/swagger');
    } else {
      expect(tree.exists(filePath)).toBeFalsy();
    }
  });
});
