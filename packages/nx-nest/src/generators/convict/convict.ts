import {
  addDependenciesToPackageJson,
  formatFiles,
  generateFiles,
  GeneratorCallback,
  installPackagesTask,
  readProjectConfiguration,
  runTasksInSerial,
  Tree,
} from '@nx/devkit';
import type { Linter } from '@nx/eslint';
import { normalizeOptions as normalizeLibraryOptions } from '@nx/nest/src/generators/library/lib/normalize-options';
import { libraryGenerator } from '@nx/nest/src/generators/library/library';
import { NormalizedOptions } from '@nx/nest/src/generators/library/schema';
import * as path from 'path';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { getNpmScope, updateJestConfig } from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';
import { ConvictGeneratorSchema } from './schema';

export async function convictGenerator(tree: Tree, options: ConvictGeneratorSchema): Promise<GeneratorCallback> {
  const appConfig = readProjectConfiguration(tree, options.projectName);
  const npmScope = getNpmScope(tree);
  const projectRoot = appConfig.root;
  const libraryOptions = await normalizeLibraryOptions(tree, {
    name: 'shared-config',
    directory: 'libs/shared/config',
    importPath: `@${getNpmScope(tree)}/shared/config`,
    projectNameAndRootFormat: 'as-provided',
    linter: 'eslint' as Linter,
    strict: true,
    unitTestRunner: 'jest',
    testEnvironment: 'node',
    skipFormat: true,
  });
  const libTasks = await generateConfigLibrary(tree, libraryOptions);
  const packageTask = updatePackageJson(tree);

  addConvictToMain(tree, projectRoot, npmScope);
  updateLogger(tree, libraryOptions.projectRoot, npmScope);
  addConfigToCoreModule(tree, projectRoot, npmScope);
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, { ...options, npmScope });
  updateJestConfig(tree, libraryOptions.projectRoot);
  await formatFiles(tree);
  return runTasksInSerial(
    ...[
      libTasks,
      packageTask,
      (): void => {
        installPackagesTask(tree);
      },
    ],
  );
}

export default convictGenerator;

function updatePackageJson(tree: Tree): GeneratorCallback {
  return addDependenciesToPackageJson(
    tree,
    { [packagesVersion['convict'].name]: packagesVersion['convict'].version },
    { [packagesVersion['typesConvict'].name]: packagesVersion['typesConvict'].version },
  );
}

async function generateConfigLibrary(tree: Tree, options: NormalizedOptions): Promise<GeneratorCallback> {
  if (tree.exists(options.projectRoot + '/project.json')) {
    return () => {
      //
    };
  }

  const libTask = await libraryGenerator(tree, options);
  tree.delete(path.join(options.projectRoot, 'src/lib/shared-config.module.ts'));
  tree.delete(path.join(options.projectRoot, 'src/index.ts'));
  generateFiles(tree, path.join(__dirname, 'files-lib'), options.projectRoot, {});

  return libTask;
}

function addConvictToMain(tree: Tree, projectRoot: string, npmScope: string): void {
  const mainPath = path.join(projectRoot, 'src/main.ts');
  let content = tree.read(mainPath)?.toString('utf-8');

  if (!content || content.includes(`@${npmScope}/shared/config`)) {
    return;
  }

  content = content.replace('await app.listen(3000);', 'await app.listen(config.port);');
  content = content.replace("defaultVersion: '1',", 'defaultVersion: config.defaultVersion,');
  content = content.replace('const port = process.env.PORT ?? 3000;', 'const port = config.port ?? 3000;');
  content = content.replace(`const globalPrefix = 'api';`, 'const globalPrefix = config.globalPrefix;');
  content = content.replace(
    'Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);',
    'Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}/v${config.defaultVersion}`);',
  );

  content = new ASTFileBuilder(content)
    .insertLinesToFunctionAfter(
      'bootstrap',
      'const app = await NestFactory.create(AppModule, { bufferLogs: true });',
      'const config: BaseConfig = app.get(CONFIG_PROVIDER);',
    )
    .addImports('CONFIG_PROVIDER', `@${npmScope}/shared/config`)
    .addImports('BaseConfig', `@${npmScope}/shared/config`)
    .build();

  if (content) {
    tree.write(mainPath, content);
  }
}

function updateLogger(tree: Tree, projectRoot: string, npmScope: string): void {
  const loggerPath = path.join(projectRoot, '..', 'logger/src/lib');
  const content = tree.read(loggerPath + '/create-base-logger.ts')?.toString('utf-8');

  if (!content || content.includes(`@${npmScope}/shared/config`)) {
    return;
  }

  tree.delete(path.join(loggerPath, 'create-base-logger.ts'));
  tree.delete(path.join(loggerPath, 'logger.module.ts'));
  generateFiles(tree, path.join(__dirname, 'files-logger'), loggerPath, { npmScope });
}

function addConfigToCoreModule(tree: Tree, projectRoot: string, npmScope: string): void {
  const module = path.join(projectRoot, 'src/app/core/core.module.ts');
  if (!tree.exists(module)) {
    return;
  }

  let fileContent: ASTFileBuilder | undefined = new ASTFileBuilder(tree.read(module)!.toString('utf-8'));

  if (fileContent.build().includes('provide: CONFIG_PROVIDER')) {
    return;
  }

  fileContent = fileContent
    .addImports('CONFIG_PROVIDER', `@${npmScope}/shared/config`)
    .addDefaultImports('config', '../../config')
    .addToModuleDecorator(
      'CoreModule',
      `{
          provide: CONFIG_PROVIDER,
          useValue: config,
        }`,
      'providers',
    );

  fileContent?.addToModuleDecorator('CoreModule', 'CONFIG_PROVIDER', 'exports');

  if (fileContent) {
    tree.write(module, fileContent.build());
  }
}
