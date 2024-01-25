import { basename, join, normalize, Path, strings } from '@angular-devkit/core';
import { apply, chain, filter, mergeWith, move, noop, Rule, template, url } from '@angular-devkit/schematics';
import { Tree } from '@angular-devkit/schematics/src/tree/interface';
import { ModuleFinder } from '@nestjs/schematics/dist/utils/module.finder';
import * as pluralize from 'pluralize';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { formatTsFile, formatTsFiles, stopExecutionIfNotRunningAtRootFolder } from '../../utils/tree-utils';

interface IServiceOptions {
  name: string;
  spec: boolean;
}

function updateModule(serviceName: string, modulePath: Path) {
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
      .addImports(strings.classify(serviceName) + 'Service', './services/' + serviceName + '.service')
      .addToModuleDecorator(moduleName, strings.classify(serviceName) + 'Service', 'providers');

    if (fileContent) {
      tree.overwrite(module, formatTsFile(fileContent.build()));
    }

    return tree;
  };
}

export function main(options: IServiceOptions): Rule {
  const name = pluralize(strings.dasherize(basename(options.name as Path)));
  const path: Path = strings.dasherize(normalize(join('src/app' as Path, options.name, '..'))) as Path;

  return chain([
    stopExecutionIfNotRunningAtRootFolder(),
    mergeWith(
      apply(url('./files'), [
        options.spec ? noop() : filter(p => !p.endsWith('.spec.ts')),
        template({
          ...strings,
          name,
        }),
        formatTsFiles(),
        move(path),
      ]),
    ),
    updateModule(name, path),
  ]);
}
