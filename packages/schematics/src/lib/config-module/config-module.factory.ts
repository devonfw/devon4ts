import { join, Path, strings } from '@angular-devkit/core';
import {
  apply,
  branchAndMerge,
  chain,
  mergeWith,
  move,
  Rule,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics/utils/module.finder';
import { packagesVersion } from '../packagesVersion';
import {
  addImports,
  insertLinesToFunctionAfter,
  addToModuleDecorator,
} from '../../utils/ast-utils';

interface IConfigOptions {
  name: string;
  path: string;
}

export function configModule(options: IConfigOptions): Rule {
  if (!options.path) {
    options.path = '.';
  }

  return (host: Tree): Rule => {
    options.name = JSON.parse(
      host.read((options.path || '.') + '/package.json')!.toString('utf-8'),
    ).name;

    return chain([
      branchAndMerge(
        mergeWith(
          apply(url('./files'), [
            template({
              ...strings,
              ...options,
            }),
            move(options.path),
          ]),
        ),
      ),
      (tree: Tree): Tree => {
        tree.overwrite(
          (options.path || '.') + '/package.json',
          updatePackageJson(tree, options),
        );
        return tree;
      },
      addToModule(options.path),
      updateMain(options.path),
    ]);
  };
}

function updateMain(project: string): Rule {
  return (tree: Tree): Tree => {
    let content = tree
      .read((project || '.') + '/src/main.ts')!
      .toString('utf-8');
    content = content.replace(
      'await app.listen(3000);',
      'await app.listen(configModule.port);',
    );
    content = content.replace(
      // tslint:disable-next-line: quotemark
      "app.setGlobalPrefix('v1');",
      'app.setGlobalPrefix(configModule.globalPrefix);',
    );

    content = insertLinesToFunctionAfter(
      content,
      'bootstrap',
      'NestFactory.create',
      'const configModule = app.select(ConfigurationModule).get(ConfigurationService);',
    );

    content = addImports(
      content,
      'ConfigurationModule',
      './app/core/configuration/configuration.module',
    );

    content = addImports(
      content,
      'ConfigurationService',
      './app/core/configuration/services',
    );

    if (content) {
      tree.overwrite((project || '.') + '/src/main.ts', content);
    }
    return tree;
  };
}

function updatePackageJson(host: Tree, _options: any): string {
  const content = JSON.parse(
    host.read((_options.path || '.') + '/package.json')!.toString('utf-8'),
  );
  content.dependencies.config = packagesVersion.config;
  content.devDependencies['@types/config'] = packagesVersion.typesConfig;

  return JSON.stringify(content, null, 2);
}

function addToModule(project: string): Rule {
  return (tree: Tree): Tree => {
    const module = new ModuleFinder(tree).find({
      name: 'core',
      path: join('.' as Path, project, 'src/app/core/') as Path,
    });
    if (!module) {
      return tree;
    }

    const fileContent = addToModuleDecorator(
      tree.read(module)!.toString('utf-8'),
      'CoreModule',
      './configuration/configuration.module',
      'ConfigurationModule',
      'imports',
      true,
    );

    if (fileContent) {
      tree.overwrite(module, fileContent);
    }

    return tree;
  };
}
