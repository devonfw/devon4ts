import { basename, join, normalize, Path, strings } from '@angular-devkit/core';
import { apply, chain, filter, mergeWith, move, noop, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics/dist/utils/module.finder';
import { formatTsFile, formatTsFiles, stopExecutionIfNotRunningAtRootFolder } from '../../utils/tree-utils';
import * as pluralize from 'pluralize';
import { ASTFileBuilder } from '../../utils/ast-file-builder';

export interface IControllerOptions {
  name: string;
  spec?: boolean;
}

function updateModule(controllerName: string, modulePath: Path) {
  return (tree: Tree): Tree => {
    const moduleName = strings.classify(basename(modulePath as Path) + '-module');
    const module = new ModuleFinder(tree).find({
      name: basename(modulePath as Path),
      path: modulePath as Path,
    });
    if (!module) {
      return tree;
    }

    const fileContent = new ASTFileBuilder(tree.read(module)!.toString('utf-8'))
      .addImports(strings.classify(controllerName) + 'Controller', './controllers/' + controllerName + '.controller')
      .addToModuleDecorator(moduleName, strings.classify(controllerName) + 'Controller', 'controllers');

    if (fileContent) {
      tree.overwrite(module, formatTsFile(fileContent.build()));
    }

    return tree;
  };
}

export function main(options: IControllerOptions): Rule {
  const name = pluralize(strings.dasherize(basename(options.name as Path)));
  const path: Path = normalize(join('src/app' as Path, strings.dasherize(options.name), '..'));

  return chain([
    stopExecutionIfNotRunningAtRootFolder(),
    mergeWith(
      apply(url('./files'), [
        options.spec ? noop() : filter(p => !p.endsWith('.spec.ts')),
        template({
          ...strings,
          name,
        }),
        move(path),
        formatTsFiles(),
      ]),
    ),
    updateModule(name, path),
  ]);
}
