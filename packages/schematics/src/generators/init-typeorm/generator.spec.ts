import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';
import { initTypeormGenerator } from './generator';
import { InitTypeormGeneratorSchema } from './schema';

describe('init-typeorm generator', () => {
  let tree: Tree;
  const options: InitTypeormGeneratorSchema = { projectName: 'test', db: 'mysql' };

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    await initTypeormGenerator(tree, options);
  });

  it('should run successfully', async () => {
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });

  it('should add dependencies to package.json', async () => {
    const fileContent = tree.read('package.json')?.toString('utf-8');
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"typeorm":/g);
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"@nestjs\/typeorm":/g);
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"class-transformer":/g);
  });

  it('should add TypeOrmModule to core.module', async () => {
    const fileContent = tree.read(`./apps/${options.projectName}/src/app/core/core.module.ts`)?.toString('utf-8');
    if (fileContent) {
      expect(fileContent).toContain('TypeOrmModule.forRootAsync');
    } else {
      expect(fileContent).toBeUndefined();
    }
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
    const filePath = `./apps/${options.projectName}/src/app/shared/app-config.ts`;
    if (tree.exists(filePath)) {
      const fileContent = tree.read(filePath)?.toString('utf-8');
      expect(fileContent).toContain('database');
    } else {
      expect(tree.exists(filePath)).toBeFalsy();
    }
  });

  it('should update config json files if convict is present', async () => {
    const filePath = `./apps/${options.projectName}/src/config/develop.json`;
    if (tree.exists(filePath)) {
      const fileContent = tree.read(filePath)?.toString('utf-8');
      expect(fileContent).toContain('database');
    } else {
      expect(tree.exists(filePath)).toBeFalsy();
    }
  });
});
