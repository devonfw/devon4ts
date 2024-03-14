/* eslint-disable no-console */
import {
  GeneratorCallback,
  Tree,
  addDependenciesToPackageJson,
  formatFiles,
  generateFiles,
  installPackagesTask,
  output,
  runTasksInSerial,
  updateJson,
} from '@nx/devkit';
import { applicationGenerator as nestApplicationGenerator } from '@nx/nest/src/generators/application/application';
import { normalizeOptions } from '@nx/nest/src/generators/application/lib/normalize-options';
import { ApplicationGeneratorOptions } from '@nx/nest/src/generators/application/schema';
import { normalizeOptions as normalizeLibraryOptions } from '@nx/nest/src/generators/library/lib/normalize-options';
import { libraryGenerator } from '@nx/nest/src/generators/library/library';
import { NormalizedOptions } from '@nx/nest/src/generators/library/schema';
import * as path from 'path';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { getNpmScope, updateJestConfig } from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';

const prettierConfiguration = {
  singleQuote: true,
  trailingComma: 'all',
  semi: true,
  printWidth: 120,
  tabWidth: 2,
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  quoteProps: 'consistent',
  useTabs: false,
};

export async function applicationGenerator(
  tree: Tree,
  options: ApplicationGeneratorOptions,
): Promise<GeneratorCallback> {
  const normalizedOptions = await normalizeOptions(tree, { ...options, strict: true, skipFormat: true });
  const npmScope = getNpmScope(tree) ?? '';

  const libraryOptions = await normalizeLibraryOptions(tree, {
    ...normalizedOptions,
    name: 'shared-logger',
    projectNameAndRootFormat: 'as-provided',
    strict: true,
    importPath: `@${npmScope}/shared/logger`,
    directory: 'libs/shared/logger',
    skipFormat: true,
    skipPackageJson: true,
    testEnvironment: 'node',
    addPlugin: true,
  });

  const appTasks = await nestApplicationGenerator(tree, normalizedOptions);
  const libTasks = await generateLoggerLibrary(tree, libraryOptions);
  if (!options.skipPackageJson) {
    updatePackageJson(tree);
  }
  updateTsconfigJson(tree);
  updatePrettier(tree);
  updateESLint(tree);
  if (!tree.exists('./husky/pre-commit')) {
    generateFiles(tree, path.join(__dirname, 'files-root'), '', normalizedOptions);
  }
  generateFiles(tree, path.join(__dirname, 'files'), normalizedOptions.appProjectRoot, {
    ...normalizedOptions,
    npmScope,
  });
  deleteFiles(tree, normalizedOptions.appProjectRoot);
  updateMain(tree, normalizedOptions.appProjectRoot, npmScope);
  addDeclarationToModule(tree, normalizedOptions.appProjectRoot);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
  return runTasksInSerial(
    ...[
      appTasks,
      libTasks,
      (): void => {
        installPackagesTask(tree);
      },
      (): void => {
        output.log({ title: `NestJS app generated successfully!` });
      },
    ],
  );
}

export default applicationGenerator;

function deleteFiles(tree: Tree, projectRoot: string): void {
  tree.delete(path.join(projectRoot, 'src/app/app.controller.ts'));
  tree.delete(path.join(projectRoot, 'src/app/app.controller.spec.ts'));
  tree.delete(path.join(projectRoot, 'src/app/app.service.ts'));
  tree.delete(path.join(projectRoot, 'src/app/app.service.spec.ts'));

  const appModulePath = path.join(projectRoot, 'src/app/app.module.ts');
  let appModule = tree.read(appModulePath)?.toString('utf-8');

  if (!appModule) {
    return;
  }

  appModule = new ASTFileBuilder(appModule).removeImports('./app.controller').removeImports('./app.service').build();
  appModule = appModule.replace('AppController', '');
  appModule = appModule.replace('AppService', '');
  tree.write(appModulePath, appModule);
}

async function generateLoggerLibrary(tree: Tree, libraryOptions: NormalizedOptions): Promise<GeneratorCallback> {
  let libTasks: GeneratorCallback = () => {
    // nothing to do
  };
  if (!tree.exists(libraryOptions.projectRoot + '/src/lib/create-base-logger.ts')) {
    libTasks = await libraryGenerator(tree, libraryOptions);
    tree.delete(`${libraryOptions.projectRoot}/src/lib/shared-logger.module.ts`);
    generateFiles(tree, path.join(__dirname, 'files-logger'), libraryOptions.projectRoot, {});
    updateJestConfig(tree, libraryOptions.projectRoot);
  }
  return libTasks;
}

function updatePackageJson(tree: Tree): void {
  // Update scripts from package.json at root directory
  if (!tree.exists('/package.json')) {
    return;
  }

  addDependenciesToPackageJson(
    tree,
    {
      [packagesVersion.winston.name]: packagesVersion.winston.version,
      [packagesVersion.classTransformer.name]: packagesVersion.classTransformer.version,
      [packagesVersion.classValidator.name]: packagesVersion.classValidator.version,
      [packagesVersion.devon4tsLogform.name]: packagesVersion.devon4tsLogform.version,
    },
    {
      [packagesVersion.devon4tsNxNest.name]: packagesVersion.devon4tsNxNest.version,
      [packagesVersion.husky.name]: packagesVersion.husky.version,
      [packagesVersion.lintStaged.name]: packagesVersion.lintStaged.version,
      [packagesVersion.nxNest.name]: packagesVersion.nxNest.version,
    },
  );
  updateJson(tree, '/package.json', pkgJson => {
    // if scripts is undefined, set it to an empty object
    pkgJson.scripts = pkgJson.scripts ?? {};
    pkgJson.scripts.prepare = 'husky';

    return pkgJson;
  });
}

function updateTsconfigJson(tree: Tree /*, npmScope: string */): void {
  if (!tree.exists(`tsconfig.base.json`)) {
    return;
  }

  updateJson(tree, `tsconfig.base.json`, tsconfigJson => {
    tsconfigJson.compilerOptions = {
      ...tsconfigJson.compilerOptions,
      strictNullChecks: true,
      noImplicitAny: true,
      strictBindCallApply: true,
      forceConsistentCasingInFileNames: true,
      noFallthroughCasesInSwitch: true,
      strict: true,
      skipDefaultLibCheck: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      skipLibCheck: true,
      allowSyntheticDefaultImports: true,
    };
    return tsconfigJson;
  });
}

function updatePrettier(tree: Tree): void {
  updateJson(tree, `/.prettierrc`, () => {
    return prettierConfiguration;
  });
  const prettierIgnoreContent = tree.read('/.prettierignore')?.toString() ?? '';
  if (!prettierIgnoreContent.includes('**/templates')) {
    tree.write('/.prettierignore', prettierIgnoreContent + `\n**/templates\n`);
  }
}

function updateESLint(tree: Tree): void {
  if (!tree.exists('/.eslintrc.json')) {
    return;
  }
  updateJson(tree, `/.eslintrc.json`, eslintConfig => {
    const typescript = eslintConfig.overrides.find((elem: { extends?: string[] }) =>
      elem.extends?.includes('plugin:@nx/typescript'),
    );
    if (typescript) {
      typescript.rules = {
        ...(typescript.rules ?? {}),
        'no-console': 'error',
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'sort-imports': [
          'error',
          {
            allowSeparatedGroups: false,
            ignoreDeclarationSort: true,
            ignoreMemberSort: true,
          },
        ],
      };
    }
    return eslintConfig;
  });
}

function updateMain(tree: Tree, projectRoot: string, npmScope: string): void {
  const mainPath = path.join(projectRoot, 'src/main.ts');
  if (!tree.exists(mainPath)) {
    return;
  }

  let mainContent = tree.read(mainPath)!.toString('utf-8');
  mainContent = mainContent.replace(
    'NestFactory.create(AppModule)',
    `NestFactory.create(AppModule, { bufferLogs: true });

      const logger = await app.resolve(WinstonLogger);
      app.useLogger(logger);

      `,
  );
  mainContent = mainContent.replace('const port = process.env.PORT || 3000', 'const port = process.env.PORT ?? 3000');
  mainContent = new ASTFileBuilder(mainContent)
    .insertLinesToFunctionBefore(
      'bootstrap',
      'app.listen',
      `app.useGlobalPipes(
        new ValidationPipe({
          transform: true,
          transformOptions: {
            excludeExtraneousValues: true,
          },
        }),
      );`,
    )
    .insertLinesToFunctionBefore(
      'bootstrap',
      'app.listen',
      `app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
      });`,
    )
    .addImports('WinstonLogger', `@${npmScope}/shared/logger`)
    .addImports('ValidationPipe', '@nestjs/common')
    .addImports('VersioningType', '@nestjs/common')
    .addReturnTypeToFunction('bootstrap', 'Promise<void>')
    .build();
  tree.write(mainPath, mainContent);
}

function addDeclarationToModule(tree: Tree, projectRoot: string): void {
  const appModulePath = path.join(projectRoot, 'src/app/app.module.ts');
  if (!tree.exists(appModulePath)) {
    return;
  }

  const fileContent = new ASTFileBuilder(tree.read(appModulePath)!.toString('utf-8'))
    .addImports('CoreModule', './core/core.module')
    .addToModuleDecorator('AppModule', 'CoreModule', 'imports');

  if (fileContent) {
    tree.write(appModulePath, fileContent.build());
  }
}
