import { dirname, join, Path, strings } from '@angular-devkit/core';
import { apply, chain, MergeStrategy, mergeWith, move, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics/dist/utils/module.finder';
import { basename, normalize } from 'path';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { formatTsFile, formatTsFiles, stopExecutionIfNotRunningAtRootFolder } from '../../utils/tree-utils';

interface IEntityOptions {
  name: string;
  module?: string;
  overwrite?: boolean;
}

function transform(options: IEntityOptions): IEntityOptions {
  const newOptions = Object.assign({}, options);

  newOptions.name = strings.dasherize(basename(options.name));
  newOptions.module = options.name.includes('/') ? dirname(options.name as Path) : undefined;

  return newOptions;
}

function addEntityToModule(options: IEntityOptions, className: string): Rule {
  return (tree: Tree): Tree => {
    const modulePosiblePath = join('src/app' as Path, options.module ?? '.');
    const moduleName = strings.classify((options.module ?? 'app') + '-module');

    const module = new ModuleFinder(tree).find({
      name: moduleName,
      path: modulePosiblePath,
    });
    if (!module) {
      return tree;
    }

    const content = new ASTFileBuilder(tree.read(module)!.toString())
      .addImports(className, './model/entities/' + options.name + '.entity')
      .addImports('TypeOrmModule', '@nestjs/typeorm')
      .addTypeormFeatureToModule(moduleName, className);

    tree.overwrite(module, formatTsFile(content.build()));

    return tree;
  };
}

function addEntityToDataSource(options: IEntityOptions, className: string, fileName: string): Rule {
  return tree => {
    const filePath = 'src/app/shared/database/main-data-source.ts';
    const dataSourceContent = tree.read(filePath)?.toString();

    if (!dataSourceContent) {
      return tree;
    }

    const updatedDataSource = new ASTFileBuilder(dataSourceContent)
      .addImports(className, join('../../' as Path, options.module ?? '.', 'model/entities', fileName))
      .addPropertyToObjectLiteralParam('AppDataSource', 0, 'entities', [className])
      .build();

    if (updatedDataSource) {
      tree.overwrite(filePath, updatedDataSource);
    }

    return tree;
  };
}

export function main(options: IEntityOptions): Rule {
  options = transform(options);

  const className = strings.classify(options.name);
  const fileName = options.name + '.entity';

  return chain([
    stopExecutionIfNotRunningAtRootFolder(),
    mergeWith(
      apply(url('./files'), [
        template({
          ...strings,
          ...options,
        }),
        formatTsFiles(),
        move(strings.dasherize(normalize('/' + join('src/app/' as Path, options.module ?? '.', './model/entities')))),
      ]),
      options.overwrite ? MergeStrategy.Overwrite : MergeStrategy.Default,
    ),
    addEntityToModule(options, className),
    addEntityToDataSource(options, className, fileName),
  ]);
}
