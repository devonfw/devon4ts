import { basename, join, normalize, Path, strings } from '@angular-devkit/core';
import { apply, chain, mergeWith, move, noop, Rule, schematic, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics/dist/utils/module.finder';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { formatTsFile, formatTsFiles, stopExecutionIfNotRunningAtRootFolder } from '../../utils/tree-utils';

interface IRespositoryOptions {
  name: string;
}

function transform(options: IRespositoryOptions): IRespositoryOptions {
  const newOptions = Object.assign({}, options);

  newOptions.name = strings.dasherize(basename(options.name as Path));

  return newOptions;
}

function addRepositoryToModule(options: IRespositoryOptions, path: Path): Rule {
  return (tree: Tree): Tree => {
    const modulePosiblePath = join(path, '..');
    const moduleName = strings.classify(basename(modulePosiblePath) + '-module');

    const module = new ModuleFinder(tree).find({
      name: moduleName,
      path: modulePosiblePath,
    });
    if (!module) {
      return tree;
    }

    const content = new ASTFileBuilder(tree.read(module)!.toString())
      .removeImports('./model/entities/' + options.name + '.entity')
      .addImports(strings.classify(options.name + '-repository'), './repositories/' + options.name + '.repository')
      .addTypeormRepositoryToModule(moduleName, strings.classify(options.name));

    tree.overwrite(module, formatTsFile(content.build()));

    return tree;
  };
}

export function main(options: IRespositoryOptions): Rule {
  const name = strings.dasherize(basename(options.name as Path));
  const path = normalize(join('src/app' as Path, options.name, '../repositories'));

  return chain([
    stopExecutionIfNotRunningAtRootFolder(),
    (tree: Tree): Rule => {
      if (!tree.exists(join(path, '../model/entities', name + '.entity.ts'))) {
        return schematic('entity', options);
      }

      return noop();
    },
    mergeWith(
      apply(url('./files'), [
        template({
          ...strings,
          name,
        }),
        formatTsFiles(),
        move(path),
      ]),
    ),
    addRepositoryToModule(transform(options), path),
  ]);
}
