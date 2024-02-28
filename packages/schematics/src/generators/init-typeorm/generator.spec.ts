import { Tree, readProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import applicationGenerator from '../application/generator';
import convictGenerator from '../convict/generator';
import { initTypeormGenerator } from './generator';
import { InitTypeormGeneratorSchema } from './schema';

describe('init-typeorm generator', () => {
  let tree: Tree;
  const options: InitTypeormGeneratorSchema = { projectName: 'test', db: 'mysql' };

  beforeAll(async () => {
    tree = createTreeWithEmptyWorkspace();
    await applicationGenerator(tree, {
      name: options.projectName,
      projectNameAndRootFormat: 'as-provided',
      directory: 'apps/test',
    });
  }, 60000);

  it('should run successfully', async () => {
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });

  it('should add dependencies to package.json', async () => {
    await initTypeormGenerator(tree, options);
    const fileContent = tree.read('package.json')?.toString('utf-8');
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"typeorm":/g);
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"@nestjs\/typeorm":/g);
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"class-transformer":/g);
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"class-validator":/g);
  });

  it('should add TypeOrmModule to core.module', async () => {
    await initTypeormGenerator(tree, options);
    const fileContent = tree
      .read(`./packages/schematics/apps/${options.projectName}/src/app/core/core.module.ts`)
      ?.toString('utf-8');
    if (fileContent) {
      expect(fileContent).toContain('TypeOrmModule.forRootAsync');
    } else {
      expect(fileContent).toBeUndefined();
    }
  });

  describe('init-typeorm generator without convict configuration', () => {
    beforeAll(async () => {
      await initTypeormGenerator(tree, options);
    });

    it('should add database properties to config.ts', async () => {
      const filePath = `./apps/${options.projectName}/src/config.ts`;
      if (tree.exists(filePath)) {
        const fileContent = tree.read(filePath)?.toString('utf-8');
        expect(fileContent).toContain('database');
      } else {
        expect(tree.exists(filePath)).toBeFalsy();
      }
    });

    it('should update config type file', async () => {
      const filePath = `./packages/schematics/apps/${options.projectName}/src/app/shared/app-config.ts`;
      if (tree.exists(filePath)) {
        const fileContent = tree.read(filePath)?.toString('utf-8');
        expect(fileContent).toContain('database');
      } else {
        expect(tree.exists(filePath)).toBeFalsy();
      }
    });

    it('should not have convict files', async () => {
      const filePath = `./packages/schematics/apps/${options.projectName}/src/config/develop.json`;
      const prodPath = `./packages/schematics/apps/${options.projectName}/src/config/prod.json`;
      const configPath = `./packages/schematics/apps/${options.projectName}/src/config.ts`;
      expect(tree.exists(filePath)).toBeFalsy();
      expect(tree.exists(prodPath)).toBeFalsy();
      expect(tree.exists(configPath)).toBeFalsy();
    });
  });

  describe('init-typeorm generator with convict configuration', () => {
    beforeAll(async () => {
      await convictGenerator(tree, options);
      await initTypeormGenerator(tree, options);
    });
    it('should update config json files if convict is present', async () => {
      const filePath = `./packages/schematics/apps/${options.projectName}/src/config/develop.json`;
      expect(tree.exists(filePath)).toBeTruthy();
    });
  });
});
