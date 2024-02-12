import { formatFiles, generateFiles, installPackagesTask, Tree } from '@nx/devkit';
import * as path from 'path';
import { ApplicationGeneratorSchema } from './schema';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { externalSchematic } from '@angular-devkit/schematics';

export async function applicationGenerator(tree: Tree, options: ApplicationGeneratorSchema): Promise<() => void> {
  externalSchematic('@nestjs/schematics', 'application', {
    name: options.projectName,
  });

  const projectRoot = `./apps/${options.projectName}/`;
  // moveFilesToNewDirectory(
  //   tree,
  //   `./${options.projectName}/src/app.controller.spec.ts`,
  //   `./${options.projectName}/src/app/app.controller.spec.ts`
  // );
  // moveFilesToNewDirectory(
  //   tree,
  //   `./${options.projectName}/src/app.controller.ts`,
  //   `./${options.projectName}/src/app/app.controller.ts`
  // );
  // moveFilesToNewDirectory(
  //   tree,
  //   `./${options.projectName}/src/app.module.ts`,
  //   `./${options.projectName}/src/app/app.module.ts`
  // );
  // moveFilesToNewDirectory(
  //   tree,
  //   `./${options.projectName}/src/app.service.ts`,
  //   `./${options.projectName}/src/app/app.service.ts`
  // );
  if (tree.exists(path.join(projectRoot, '.eslintrc.js'))) {
    tree.delete(path.join(projectRoot, '.eslintrc.js'));
  }
  // addDependenciesToPackageJson(tree, {}, {});
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  updateMain(tree, projectRoot);
  addDeclarationToModule(tree, projectRoot);
  await formatFiles(tree);
  return () => {
    installPackagesTask(tree, false, '', 'pnpm');
  };
}

export default applicationGenerator;

function updateMain(tree: Tree, projectRoot: string): void {
  const mainPath = path.join(projectRoot, 'src/main.ts');
  if (!tree.exists(mainPath)) {
    return;
  }

  let mainContent = tree.read(mainPath).toString('utf-8');

  mainContent = mainContent.replace('./app.module', './app/app.module');
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

  const fileContent = new ASTFileBuilder(tree.read(appModulePath)?.toString('utf-8'))
    .addImports('CoreModule', './core/core.module')
    .addToModuleDecorator('AppModule', 'CoreModule', 'imports');

  if (fileContent) {
    tree.write(appModulePath, fileContent.build());
  }
}

// import { addProjectConfiguration, formatFiles, generateFiles, Tree } from '@nx/devkit';
// import * as path from 'path';
// import { ApplicationGeneratorSchema } from './schema';

// export async function applicationGenerator(tree: Tree, options: ApplicationGeneratorSchema) {
//   const projectRoot = `libs/${options.name}`;
//   addProjectConfiguration(tree, options.name, {
//     root: projectRoot,
//     projectType: 'application',
//     sourceRoot: `${projectRoot}/src`,
//     targets: {},
//   });
//   generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
//   await formatFiles(tree);
// }

// export default applicationGenerator;
