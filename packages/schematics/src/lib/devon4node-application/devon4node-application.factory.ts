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
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { mergeFiles } from '../../utils/merge';
import { formatTsFile } from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';

export interface IDevon4nodeApplicationOptions {
  name: string;
}

function updateMain(project: string) {
  return (host: Tree): Tree => {
    let mainFile = host.read(join(project as Path, 'src/main.ts'))!.toString('utf-8');

    mainFile = mainFile.replace('./app.module', './app/app.module');
    mainFile = mainFile.replace(
      'NestFactory.create(AppModule)',
      `NestFactory.create(AppModule, { bufferLogs: true });

      const logger = await app.resolve(WinstonLogger);
      app.useLogger(logger);

      `,
    );

    mainFile = new ASTFileBuilder(mainFile)
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

    const fileContent = new ASTFileBuilder(tree.read(module)!.toString('utf-8'))
      .addImports('CoreModule', './core/core.module')
      .addToModuleDecorator('AppModule', 'CoreModule', 'imports');

    if (fileContent) {
      tree.overwrite(module, formatTsFile(fileContent.build()));
    }

    return tree;
  };
}

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function devon4nodeApplication(options: IDevon4nodeApplicationOptions): Rule {
  const formattedOptions = { ...options };
  formattedOptions.name = strings.dasherize(formattedOptions.name);
  const name = formattedOptions.name;

  return chain([
    externalSchematic('@nestjs/schematics', 'application', formattedOptions),
    move(`./${name}/src/app.controller.spec.ts`, `./${name}/src/app/app.controller.spec.ts`),
    move(`./${name}/src/app.controller.ts`, `./${name}/src/app/app.controller.ts`),
    move(`./${name}/src/app.module.ts`, `./${name}/src/app/app.module.ts`),
    move(`./${name}/src/app.service.ts`, `./${name}/src/app/app.service.ts`),
    (tree: Tree): Tree => {
      if (tree.exists(join(name as Path, '.eslintrc.js'))) {
        tree.delete(join(name as Path, '.eslintrc.js'));
      }

      return tree;
    },
    (tree: Tree): Rule => {
      return mergeWith(
        apply(url('./files'), [
          template({
            ...strings,
            ...formattedOptions,
            ...packagesVersion,
          }),
          move(name),
          mergeFiles(tree),
        ]),
      );
    },
    addDeclarationToModule(name),
    updateMain(name),
  ]);
}
