import { ProjectConfiguration, Tree, readProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import type { ApplicationGeneratorOptions } from '@nx/nest/src/generators/application/schema';
import applicationGenerator from './application';

describe('application generator', () => {
  let tree: Tree;
  const options: ApplicationGeneratorOptions = {
    name: 'something',
    directory: 'apps/something',
    projectNameAndRootFormat: 'as-provided',
  };
  let appConfig: ProjectConfiguration;
  let loggerConfig: ProjectConfiguration;

  beforeAll(async () => {
    tree = createTreeWithEmptyWorkspace();
    await applicationGenerator(tree, options);
    appConfig = readProjectConfiguration(tree, options.name);
    loggerConfig = readProjectConfiguration(tree, 'shared-logger');
  }, 60000);

  it('should run successfully', () => {
    expect(appConfig).toBeDefined();
    expect(loggerConfig).toBeDefined();
    expect(appConfig).toMatchSnapshot();
    expect(loggerConfig).toMatchSnapshot();
  });

  describe('application', () => {
    it('should create the application', () => {
      expect(tree.exists(`${appConfig.root}/src/main.ts`)).toBeTruthy();
      expect(tree.exists(`${appConfig.root}/src/app/app.module.ts`)).toBeTruthy();
      expect(tree.exists(`${appConfig.root}/src/app/app.controller.ts`)).toBeFalsy();
      expect(tree.exists(`${appConfig.root}/src/app/app.service.ts`)).toBeFalsy();
      expect(tree.exists(`${appConfig.root}/src/app/app.controller.spec.ts`)).toBeFalsy();
      expect(tree.exists(`${appConfig.root}/src/app/app.service.spec.ts`)).toBeFalsy();
    });

    it('should generate core module', async () => {
      expect(tree.exists(`${appConfig.sourceRoot}/app/core/core.module.ts`)).toBeTruthy();
      expect(tree.read(`${appConfig.sourceRoot}/app/core/core.module.ts`)?.toString('utf-8')).toMatchSnapshot();
    });

    it('should add core module declaration to app module', async () => {
      const fileContent = tree.read(`${appConfig.sourceRoot}/app/app.module.ts`)?.toString('utf-8');
      expect(fileContent).toContain('CoreModule');
      expect(fileContent).toMatchSnapshot();
    });

    it('should update main.ts properly', () => {
      const fileContent = tree.read(`${appConfig.sourceRoot}/main.ts`)?.toString('utf-8');
      expect(fileContent).toMatchSnapshot();
    });
  });

  describe('logger library', () => {
    it('should generate logger library', () => {
      expect(tree.exists(`${loggerConfig.sourceRoot}/index.ts`)).toBeTruthy();
      expect(tree.exists(`${loggerConfig.sourceRoot}/lib/create-base-logger.ts`)).toBeTruthy();
      expect(tree.exists(`${loggerConfig.sourceRoot}/lib/logger-formatters.ts`)).toBeTruthy();
      expect(tree.exists(`${loggerConfig.sourceRoot}/lib/logger.module.ts`)).toBeTruthy();
      expect(tree.exists(`${loggerConfig.sourceRoot}/lib/winston-logger.ts`)).toBeTruthy();
      expect(tree.exists(`${loggerConfig.sourceRoot}/lib/shared-logger.module.ts`)).toBeFalsy();
    });
  });

  describe('global files', () => {
    it('should generate husky configuration and vscode settings', () => {
      expect(tree.exists(`.husky/pre-commit`)).toBeTruthy();
      expect(tree.exists(`.vscode/settings.json`)).toBeTruthy();
      expect(tree.exists(`.lintstagedrc.json`)).toBeTruthy();
    });
    it('should add dependencies to package.json', async () => {
      const fileContent = tree.read('package.json')?.toString('utf-8');
      expect(fileContent).toMatchSnapshot();
    });

    it('should update tsconfig.base.json', async () => {
      expect(tree.exists(`tsconfig.base.json`)).toBeTruthy();
      expect(tree.read('tsconfig.base.json')?.toString('utf-8')).toMatchSnapshot();
    });

    it('should update the ESLint global configuration', () => {
      expect(tree.read('/.eslintrc.json')?.toString('utf-8')).toMatchSnapshot();
    });

    it('should update the global prettier configuration', () => {
      expect(tree.read(`/.prettierrc`)?.toString('utf-8')).toMatchSnapshot();
      expect(tree.read(`/.prettierignore`)?.toString('utf-8')).toMatchSnapshot();
    });
  });
});
