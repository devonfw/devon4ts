import { join, Path, strings } from '@angular-devkit/core';
import {
  apply,
  chain,
  externalSchematic,
  mergeWith,
  move,
  Rule,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics/dist/utils/module.finder';
import {
  addImports,
  addToModuleDecorator,
  insertLinesToFunctionBefore,
  addReturnTypeToFunction,
} from '../../utils/ast-utils';
import { packagesVersion } from '../packagesVersion';
import { mergeFiles } from '../../utils/merge';
import { formatTsFile } from '../../utils/tree-utils';

interface IDevon4nodeApplicationOptions {
  name: string;
}

function updateMain(project: string) {
  return (host: Tree): Tree => {
    let mainFile = host.read(join(project as Path, 'src/main.ts'))!.toString('utf-8');

    mainFile = mainFile.replace('./app.module', './app/app.module');
    mainFile = mainFile.replace(
      'NestFactory.create(AppModule)',
      'NestFactory.create(AppModule, { logger: new WinstonLogger() })',
    );

    mainFile = insertLinesToFunctionBefore(
      mainFile,
      'bootstrap',
      'app.listen',
      `app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );`,
    );

    mainFile = insertLinesToFunctionBefore(
      mainFile,
      'bootstrap',
      'app.listen',
      // tslint:disable-next-line: quotemark
      "app.setGlobalPrefix('v1');",
    );

    mainFile = addImports(mainFile, 'WinstonLogger', './app/shared/logger/winston.logger');
    mainFile = addImports(mainFile, 'ValidationPipe', '@nestjs/common');
    mainFile = addImports(mainFile, 'Logger', '@nestjs/common');
    mainFile = addReturnTypeToFunction(mainFile, 'bootstrap', 'Promise<void>');
    host.overwrite(join(project as Path, 'src/main.ts'), formatTsFile(mainFile));

    return host;
  };
}

function addDeclarationToModule(project: string): Rule {
  return (tree: Tree): Tree => {
    const module = new ModuleFinder(tree).find({
      name: 'app',
      path: (project + '/src/app/') as Path,
    });
    if (!module) {
      return tree;
    }

    const fileContent = addToModuleDecorator(
      tree.read(module)!.toString('utf-8'),
      'AppModule',
      './core/core.module',
      'CoreModule',
      'imports',
      false,
    );

    if (fileContent) {
      tree.overwrite(module, formatTsFile(fileContent));
    }

    return tree;
  };
}

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function devon4nodeApplication(options: IDevon4nodeApplicationOptions): Rule {
  return chain([
    externalSchematic('@nestjs/schematics', 'application', options),
    move(`./${options.name}/src/app.controller.spec.ts`, `./${options.name}/src/app/app.controller.spec.ts`),
    move(`./${options.name}/src/app.controller.ts`, `./${options.name}/src/app/app.controller.ts`),
    move(`./${options.name}/src/app.module.ts`, `./${options.name}/src/app/app.module.ts`),
    move(`./${options.name}/src/app.service.ts`, `./${options.name}/src/app/app.service.ts`),
    (tree: Tree): Tree => {
      if (tree.exists(join(options.name as Path, '.eslintrc.js'))) {
        tree.delete(join(options.name as Path, '.eslintrc.js'));
      }

      return tree;
    },
    (tree: Tree): Rule => {
      return mergeWith(
        apply(url('./files'), [
          template({
            ...strings,
            ...options,
            ...packagesVersion,
          }),
          move(options.name),
          mergeFiles(tree),
        ]),
      );
    },
    addDeclarationToModule(options.name),
    updateMain(options.name),
  ]);
}
