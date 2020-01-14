import { join, Path, strings } from '@angular-devkit/core';
import { apply, chain, mergeWith, move, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics/dist/utils/module.finder';
import { basename, normalize } from 'path';
import { addImports, addTypeormFeatureToModule } from '../../utils/ast-utils';
import { formatTsFile, formatTsFiles } from '../../utils/tree-utils';

interface IEntityOptions {
  name: string;
  path?: string;
  flat?: boolean;
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
    ),
    addEntityToModule(options),
  ]);
}

function transform(options: IEntityOptions): IEntityOptions {
  const newOptions = Object.assign({}, options);

  newOptions.name = strings.dasherize(basename(options.name));
  newOptions.path = strings.dasherize(
    normalize('/' + join((options.path || '') as Path, 'src/app/', options.name, '../model/entities')),
  );

  return newOptions;
}

function addEntityToModule(options: IEntityOptions) {
  return (tree: Tree) => {
    const modulePosiblePath = join(options.path! as Path, '../..');
    const moduleName = strings.classify(basename(modulePosiblePath) + '-module');

    const module = new ModuleFinder(tree).find({
      name: moduleName,
      path: modulePosiblePath,
    });
    if (!module) {
      return tree;
    }

    let content = tree.read(module)!.toString();

    content = addImports(content, strings.classify(options.name), './model/entities/' + options.name + '.entity');
    content = addImports(content, 'TypeOrmModule', '@nestjs/typeorm');

    tree.overwrite(
      module,
      formatTsFile(addTypeormFeatureToModule(content, moduleName, strings.classify(options.name))),
    );

    return tree;
  };
}
