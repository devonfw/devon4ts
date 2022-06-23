import { join, Path, strings } from '@angular-devkit/core';
import { apply, chain, MergeStrategy, mergeWith, move, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics/dist/utils/module.finder';
import { basename, normalize } from 'path';
import { formatTsFile, formatTsFiles } from '../../utils/tree-utils';
import { ASTFileBuilder } from '../../utils/ast-file-builder';

interface IEntityOptions {
  name: string;
  path?: string;
  flat?: boolean;
  overwrite?: boolean;
}

function transform(options: IEntityOptions): IEntityOptions {
  const newOptions = Object.assign({}, options);

  newOptions.name = strings.dasherize(basename(options.name));
  newOptions.path = strings.dasherize(
    normalize('/' + join((options.path || '') as Path, 'src/app/', options.name, '../model/entities')),
  );

  return newOptions;
}

function addEntityToModule(options: IEntityOptions): Rule {
  return (tree: Tree): Tree => {
    const modulePosiblePath = join(options.path! as Path, '../..');
    const moduleName = strings.classify(basename(modulePosiblePath) + '-module');

    const module = new ModuleFinder(tree).find({
      name: moduleName,
      path: modulePosiblePath,
    });
    if (!module) {
      return tree;
    }

    const content = new ASTFileBuilder(tree.read(module)!.toString())
      .addImports(strings.classify(options.name), './model/entities/' + options.name + '.entity')
      .addImports('TypeOrmModule', '@nestjs/typeorm')
      .addTypeormFeatureToModule(moduleName, strings.classify(options.name));

    tree.overwrite(module, formatTsFile(content.build()));

    return tree;
  };
}

export function main(options: IEntityOptions): Rule {
  options = transform(options);

  return chain([
    mergeWith(
      apply(url('./files'), [
        template({
          ...strings,
          ...options,
        }),
        formatTsFiles(),
        move(options.path!),
      ]),
      options.overwrite ? MergeStrategy.Overwrite : MergeStrategy.Default,
    ),
    addEntityToModule(options),
  ]);
}
