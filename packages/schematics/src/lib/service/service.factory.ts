import { basename, join, normalize, Path, strings } from '@angular-devkit/core';
import {
  apply,
  chain,
  filter,
  mergeWith,
  move,
  noop,
  Rule,
  template,
  url,
} from '@angular-devkit/schematics';
import { Tree } from '@angular-devkit/schematics/src/tree/interface';
import { ModuleFinder } from '@nestjs/schematics/utils/module.finder';
import { addToModuleDecorator } from '../../utils/ast-utils';
import { addBarrels } from '../../utils/tree-utils';

interface IServiceOptions {
  name: string;
  path: string;
  spec: boolean;
}

export function main(options: IServiceOptions): Rule {
  const name = strings.dasherize(basename(options.name as Path));
  const projectPath = options.path || '.';
  const path = normalize(
    join(projectPath as Path, 'src/app', options.name, '..'),
  );
  return chain([
    mergeWith(
      apply(url('./files'), [
        options.spec ? noop() : filter(p => !p.endsWith('.spec.ts')),
        template({
          ...strings,
          name,
        }),
        move(path),
      ]),
    ),
    (tree: Tree): Tree => {
      addBarrels(tree, join(path, 'services'), name + '.service');
      return tree;
    },
    updateModule(name, path),
  ]);
}

function updateModule(serviceName: string, modulePath: Path) {
  return (tree: Tree): Tree => {
    const moduleName = strings.classify(
      basename(modulePath as Path) + '-module',
    );
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
      './services',
      strings.classify(serviceName) + 'Service',
      'providers',
      false,
    );

    if (fileContent) {
      tree.overwrite(module, fileContent);
    }

    return tree;
  };
}
