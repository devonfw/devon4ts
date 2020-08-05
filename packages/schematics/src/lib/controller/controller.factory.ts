import { basename, dirname, join, normalize, Path, strings } from '@angular-devkit/core';
import { apply, chain, filter, mergeWith, move, noop, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics/dist/utils/module.finder';
import * as pluralize from 'pluralize';
import { addToModuleDecorator } from '~utils/ast-utils';
import { formatTsFiles, formatTsFile } from '~utils/tree-utils';

interface IControllerOptions {
  name: string;
  path: string;
  spec: boolean;
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

    const fileContent = addToModuleDecorator(
      tree.read(module)!.toString('utf-8'),
      moduleName,
      './controllers/' + controllerName + '.controller',
      strings.classify(controllerName) + 'Controller',
      'controllers',
      false,
    );

    if (fileContent) {
      tree.overwrite(module, formatTsFile(fileContent));
    }

    return tree;
  };
}

export function main(options: IControllerOptions): Rule {
  const name = strings.dasherize(basename(options.name as Path));
  const fullName = strings.dasherize(join(dirname(options.name as Path), pluralize.plural(name)));
  const projectPath = options.path || '.';
  const path: Path = strings.dasherize(normalize(join(projectPath as Path, 'src/app', options.name, '..'))) as Path;

  return chain([
    mergeWith(
      apply(url('./files'), [
        options.spec ? noop() : filter(p => !p.endsWith('.spec.ts')),
        template({
          ...strings,
          name,
          fullName,
        }),
        move(path),
        formatTsFiles(),
      ]),
    ),
    updateModule(name, path),
  ]);
}
