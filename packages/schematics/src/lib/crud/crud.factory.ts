import { basename, dirname, join, normalize, Path, strings } from '@angular-devkit/core';
import { apply, chain, mergeWith, move, Rule, schematic, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics/dist/utils/module.finder';
import * as pluralize from 'pluralize';
import { addToModuleDecorator } from '../../utils/ast-utils';
import { addBarrels, formatTsFile, formatTsFiles } from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';

interface ICrudOptions {
  name: string;
  path?: string;
}

export function crud(options: ICrudOptions): Rule {
  const name = strings.dasherize(basename(options.name as Path));
  const fullName = join(dirname(options.name as Path), pluralize.plural(name));
  const projectPath = options.path || '.';
  const path = normalize(join(projectPath as Path, 'src/app', options.name, '..'));
  return chain([
    schematic('entity', options),
    mergeWith(
      apply(url('./files'), [
        template({
          ...strings,
          name,
          fullName,
        }),
        formatTsFiles(),
        move(path),
      ]),
    ),
    updatePackageJson(projectPath),
    updateModule(name, path),
  ]);
}

function updatePackageJson(path: string): Rule {
  return (tree: Tree): Tree => {
    const packageJson = JSON.parse(tree.read(join(path as Path, 'package.json'))!.toString());

    packageJson.dependencies['@nestjsx/crud'] = packagesVersion.nestjsxCrud;
    packageJson.dependencies['@nestjsx/crud-typeorm'] = packagesVersion.nestjsxCrudTypeorm;

    tree.overwrite(join(path as Path, 'package.json'), JSON.stringify(packageJson, null, 2));
    return tree;
  };
}

function updateModule(crudName: string, modulePath: string) {
  return (tree: Tree): Tree => {
    const moduleName = strings.classify(basename(modulePath as Path) + '-module');
    const module = new ModuleFinder(tree).find({
      name: basename(modulePath as Path),
      path: modulePath as Path,
    });
    if (!module) {
      return tree;
    }

    let fileContent = addToModuleDecorator(
      tree.read(module)!.toString('utf-8'),
      moduleName,
      './services',
      strings.classify(crudName) + 'CrudService',
      'providers',
      false,
    );

    fileContent = addToModuleDecorator(
      fileContent!,
      moduleName,
      './controllers',
      strings.classify(crudName) + 'CrudController',
      'controllers',
      false,
    );

    if (fileContent) {
      tree.overwrite(module, formatTsFile(fileContent));
    }

    addBarrels(tree, join(modulePath as Path, 'services'), crudName + '.crud.service');
    addBarrels(tree, join(modulePath as Path, 'controllers'), crudName + '.crud.controller');

    return tree;
  };
}
