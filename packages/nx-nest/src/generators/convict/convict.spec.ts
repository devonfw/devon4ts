import { ProjectConfiguration, Tree, readProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { ApplicationGeneratorOptions } from '@nx/nest/src/generators/application/schema';
import applicationGenerator from '../application/application';
import { convictGenerator } from './convict';

describe('convict generator', () => {
  let tree: Tree;
  const options: ApplicationGeneratorOptions = {
    name: 'test',
    projectNameAndRootFormat: 'as-provided',
    directory: 'apps/test',
    skipFormat: true,
    skipPackageJson: true,
  };
  let appConfig: ProjectConfiguration;
  let loggerConfig: ProjectConfiguration;
  let convictConfig: ProjectConfiguration;

  beforeAll(async () => {
    tree = createTreeWithEmptyWorkspace();
    await applicationGenerator(tree, options);
    await convictGenerator(tree, {
      projectName: options.name,
    });
    await convictGenerator(tree, {
      projectName: options.name,
    });
    appConfig = readProjectConfiguration(tree, options.name);
    loggerConfig = readProjectConfiguration(tree, 'shared-logger');
    convictConfig = readProjectConfiguration(tree, 'shared-config');
  }, 60000);

  it('should run successfully', async () => {
    expect(appConfig).toBeDefined();
    expect(loggerConfig).toBeDefined();
    expect(convictConfig).toBeDefined();
  });

  describe('convict library', () => {
    it('should generate convict library files', () => {
      expect(tree.exists(`${convictConfig.root}/src/lib/base-config.ts`)).toBeTruthy();
      expect(tree.exists(`${convictConfig.root}/src/lib/config.ts`)).toBeTruthy();
      expect(tree.exists(`${convictConfig.root}/src/lib/default-config.ts`)).toBeTruthy();
      expect(tree.exists(`${convictConfig.root}/src/lib/shared-config.module.ts`)).toBeFalsy();
      expect(tree.read(`${convictConfig.root}/src/index.ts`)?.toString('utf-8')).toMatchSnapshot();
    });
  });

  describe('application files', () => {
    it('should add convict configuration to main.ts', async () => {
      expect(tree.read(`${appConfig.root}/src/main.ts`)?.toString('utf-8')).toMatchSnapshot();
    });

    it('should generate config.ts file', async () => {
      expect(tree.read(`${appConfig.root}/src/config.ts`)?.toString('utf-8')).toMatchSnapshot();
    });

    it('should add config provider as global in core.module', () => {
      expect(tree.read(`${appConfig.root}/src/app/core/core.module.ts`)?.toString('utf-8')).toMatchSnapshot();
    });
  });

  describe('root files', () => {
    it('should add dependencies to package.json', async () => {
      const fileContent = tree.read('package.json')?.toString('utf-8');
      expect(fileContent).toMatch(/"dependencies": {(.|\n)*"convict":/g);
      expect(fileContent).toMatch(/"dependencies": {(.|\n)*"@types\/convict":/g);
    });

    it('should update tsconfig.base.json', () => {
      expect(tree.read(`tsconfig.base.json`)?.toString('utf-8')).toMatchSnapshot();
    });
  });

  describe('logger library', () => {
    it('should update logger configuration', async () => {
      expect(tree.read(`${loggerConfig.root}/src/lib/create-base-logger.ts`)?.toString('utf-8')).toMatchSnapshot();
      expect(tree.read(`${loggerConfig.root}/src/lib/logger.module.ts`)?.toString('utf-8')).toMatchSnapshot();
    });
  });
});
