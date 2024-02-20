import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  installPackagesTask,
  Tree,
  updateJson,
} from '@nx/devkit';
import * as path from 'path';
import { ApplicationGeneratorSchema } from './schema';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { stdout } from 'process';
import { packagesVersion } from '../packagesVersion';
import { applicationGenerator as nestApplicationGenerator } from '@nx/nest';

export async function applicationGenerator(tree: Tree, options: ApplicationGeneratorSchema): Promise<() => void> {
  const projectRoot = `apps/${options.projectName}`;
  if (tree.exists(projectRoot)) {
    throw new Error(`Application with name "${options.projectName}" already exists`);
  }
  addProjectConfiguration(tree, options.projectName, {
    root: projectRoot,
    projectType: 'application',
    sourceRoot: `${projectRoot}/src`,
    targets: {},
  });
  try {
    await nestApplicationGenerator(tree, {
      name: options.projectName,
    });
  } catch (error) {
    throw new Error(`An error ocurred while trying to create the app.`);
  }
  if (tree.exists(path.join(projectRoot, '.eslintrc.json'))) {
    tree.delete(path.join(projectRoot, '.eslintrc.json'));
  }
  addDependenciesToPackageJson(
    tree,
    {
      [packagesVersion['express'].name]: packagesVersion['express'].version,
      [packagesVersion['typeFest'].name]: packagesVersion['typeFest'].version,
      [packagesVersion['winston'].name]: packagesVersion['winston'].version,
      [packagesVersion['classTransformer'].name]: packagesVersion['classTransformer'].version,
      [packagesVersion['classValidator'].name]: packagesVersion['classValidator'].version,
    },
    {
      [packagesVersion['husky'].name]: packagesVersion['husky'].version,
      [packagesVersion['prettyQuick'].name]: packagesVersion['prettyQuick'].version,
      [packagesVersion['typesExpress'].name]: packagesVersion['typesExpress'].version,
      [packagesVersion['eslintPluginPrettier'].name]: packagesVersion['eslintPluginPrettier'].version,
    },
  );
  updatePackageJson(tree, options.projectName);
  updateTsconfigJson(tree, projectRoot);
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  updateMain(tree, projectRoot);
  addDeclarationToModule(tree, projectRoot);
  await formatFiles(tree);
  return () => {
    installPackagesTask(tree, false, '', 'pnpm');
    stdout.write(`NestJS app generated successfully!`);
  };
}

export default applicationGenerator;

function updatePackageJson(tree: Tree, projectName: string): void {
  // Update scripts from package.json at root directory
  if (tree.exists('package.json')) {
    updateJson(tree, 'package.json', pkgJson => {
      // if scripts is undefined, set it to an empty object
      pkgJson.scripts = pkgJson.scripts ?? {};
      pkgJson.scripts.lint = 'eslint {apps,packages}/{src,apps,libs,test}/**/*.ts --fix';
      pkgJson.scripts.prepare = 'husky';
      // if jest is undefined, set it to an empty object
      pkgJson.jest = pkgJson.jest ?? {};
      pkgJson.jest.coverageDirectory = `./apps/${projectName}/coverage`;
      // return modified JSON object
      return pkgJson;
    });
  } else {
    stdout.write('File named package.json at root directory was not found. Skipping task.');
  }
}
function updateTsconfigJson(tree: Tree, projectRoot: string): void {
  // Update compilerOptions from tsconfig.json at application directory
  if (tree.exists(`${projectRoot}/tsconfig.json`)) {
    updateJson(tree, `${projectRoot}/tsconfig.json`, tsconfigJson => {
      tsconfigJson.compilerOptions = {
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
  } else {
    stdout.write(`File at ${projectRoot}/tsconfig.json was not found. Skipping task.`);
  }
}

function updateMain(tree: Tree, projectRoot: string): void {
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
      );
      app.useGlobalFilters(new EntityNotFoundFilter(logger));`,
    )
    .insertLinesToFunctionBefore(
      'bootstrap',
      'app.listen',
      `app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
      });`,
    )
    .addImports('WinstonLogger', './app/shared/logger/winston.logger')
    .addImports('ValidationPipe', '@nestjs/common')
    .addImports('VersioningType', '@nestjs/common')
    .addImports('EntityNotFoundFilter', './app/shared/filters/entity-not-found.filter')
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
