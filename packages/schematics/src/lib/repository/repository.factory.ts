import { basename, join, normalize, Path, strings } from '@angular-devkit/core';
import { apply, chain, mergeWith, move, noop, Rule, schematic, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics/dist/utils/module.finder';
import { addImports, addTypeormRepositoryToModule, removeImports } from '../../utils/ast-utils';
import { formatTsFile, formatTsFiles } from '../../utils/tree-utils';

interface IRespositoryOptions {
  name: string;
  path?: string;
}

function transform(options: IRespositoryOptions): IRespositoryOptions {
  const newOptions = Object.assign({}, options);

  newOptions.name = strings.dasherize(basename(options.name as Path));
  newOptions.path = strings.dasherize(
    normalize('/' + join((options.path || '') as Path, 'src/app/', options.name, '../model/entities')),
  );

  return newOptions;
}

function addRepositoryToModule(options: IRespositoryOptions): Rule {
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

    let content = tree.read(module)!.toString();

    content = removeImports(content, './model/entities/' + options.name + '.entity');
    content = addImports(
      content,
      strings.classify(options.name + '-repository'),
      './repositories/' + options.name + '.repository',
    );

    tree.overwrite(
      module,
      formatTsFile(addTypeormRepositoryToModule(content, moduleName, strings.classify(options.name))),
    );

    return tree;
  };
}

export function main(options: IRespositoryOptions): Rule {
  const name = strings.dasherize(basename(options.name as Path));
  const projectPath = options.path || '.';
  const path = normalize(join(projectPath as Path, 'src/app', options.name, '../repositories'));

  return chain([
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
    addRepositoryToModule(transform(options)),
  ]);
}
