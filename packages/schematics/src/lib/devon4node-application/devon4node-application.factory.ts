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
import { ModuleFinder } from '@nestjs/schematics/utils/module.finder';
import { addImports, addToModuleDecorator, insertLinesToFunctionBefore } from '../../utils/ast-utils';
import { packagesVersion } from '../packagesVersion';
import { mergeFiles } from '../../utils/merge';

interface IDevon4nodeApplicationOptions {
  name: string;
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
    // (host: Tree): Tree => {
    //   host.overwrite(join(options.name as Path, 'tsconfig.json'), updateTsConfig(host, options));
    //   return host;
    // },
    // (host: Tree): Tree => {
    //   host.overwrite(join(options.name as Path, 'nest-cli.json'), updateNestCliJson(host, options));
    //   return host;
    // },
    // (host: Tree): Tree => {
    //   host.overwrite(join(options.name as Path, 'package.json'), updatePackageJson(host, options));
    //   return host;
    // },
    // (host: Tree): Tree => {
    //   host.overwrite(join(options.name as Path, '.prettierrc'), updatePrettier(host, options));
    //   return host;
    // },
    // (host: Tree): Tree => {
    //   host.overwrite(join(options.name as Path, 'tslint.json'), updateTsLint(host, options));
    //   return host;
    // },
    addDeclarationToModule(options.name),
    updateMain(options.name),
  ]);
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
      'NestFactory.create',
      'Logger.overrideLogger(["debug", "error", "log", "verbose", "warn"]);',
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
    host.overwrite(join(project as Path, 'src/main.ts'), mainFile);

    return host;
  };
}

// function updateTsConfig(host: Tree, _options: any): string {
//   const content = JSON.parse(host.read(join(_options.name, 'tsconfig.json'))!.toString('utf-8'));
//   content.compilerOptions.strict = true;
//   content.compilerOptions.skipLibCheck = true;
//   content.compilerOptions.skipDefaultLibCheck = true;
//   content.compilerOptions.noUnusedLocals = true;
//   content.compilerOptions.noUnusedParameters = true;
//   content.compilerOptions.noFallthroughCasesInSwitch = true;
//   content.compilerOptions.allowSyntheticDefaultImports = true;

//   return JSON.stringify(content, null, 2);
// }

// function updatePackageJson(host: Tree, _options: any): string {
//   const content = JSON.parse(host.read(join(_options.name, 'package.json'))!.toString('utf-8'));

//   content.dependencies.winston = packagesVersion.winston;
//   content.dependencies['class-transformer'] = packagesVersion.classTransformer;
//   content.dependencies['class-validator'] = packagesVersion.classValidator;
//   content.dependencies['@devon4node/common'] = packagesVersion.devon4nodeCommon;
//   content.devDependencies.husky = packagesVersion.husky;

//   return JSON.stringify(content, null, 2);
// }

// function updatePrettier(host: Tree, _options: any): string {
//   const content = JSON.parse(host.read(join(_options.name, '.prettierrc'))!.toString('utf-8'));

//   content.printWidth = 120;

//   return JSON.stringify(content, null, 2);
// }

// function updateTsLint(host: Tree, _options: any): string {
//   const content = JSON.parse(host.read(join(_options.name, 'tslint.json'))!.toString('utf-8'));

//   content.rules['interface-name'] = [true];
//   content.rules['variable-name'] = {
//     options: ['ban-keywords', 'check-format', 'allow-pascal-case', 'allow-leading-underscore'],
//   };

//   return JSON.stringify(content, null, 2);
// }

// function updateNestCliJson(host: Tree, _options: any): string {
//   const content = JSON.parse(host.read(join(_options.name, 'nest-cli.json'))!.toString('utf-8'));

//   content.collection = '@devon4node/schematics';

//   return JSON.stringify(content, null, 2);
// }

function addDeclarationToModule(project: string): Rule {
  return (tree: Tree) => {
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
      tree.overwrite(module, fileContent);
    }

    return tree;
  };
}
