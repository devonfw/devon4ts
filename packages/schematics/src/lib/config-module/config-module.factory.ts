import { join, Path, strings } from '@angular-devkit/core';
import { apply, chain, mergeWith, move, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics/dist/utils/module.finder';
import { packagesVersion } from '../packagesVersion';
import { addImports, insertLinesToFunctionAfter, addToModuleDecorator } from '../../utils/ast-utils';
import { formatTsFile, formatTsFiles } from '../../utils/tree-utils';
import { mergeFiles } from '../../utils/merge';

interface IConfigOptions {
  name: string;
  path: string;
}

function updateMain(project: string): Rule {
  return (tree: Tree): Tree => {
    let content = tree.read((project || '.') + '/src/main.ts')!.toString('utf-8');
    content = content.replace('await app.listen(3000);', 'await app.listen(configModule.values.port);');
    content = content.replace("app.setGlobalPrefix('v1');", 'app.setGlobalPrefix(configModule.values.globalPrefix);');

    content = insertLinesToFunctionAfter(
      content,
      'bootstrap',
      'NestFactory.create',
      'const configModule = app.get(ConfigService);',
    );

    content = addImports(content, 'ConfigService', '@devon4node/config');

    if (content) {
      tree.overwrite((project || '.') + '/src/main.ts', formatTsFile(content));
    }
    return tree;
  };
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

    let fileContent = addToModuleDecorator(
      tree.read(module)!.toString('utf-8'),
      'CoreModule',
      '@devon4node/config',
      `ConfigModule.forRoot({
        configPrefix: 'devon4node',
        configType: Config,
      })`,
      'imports',
      true,
    );

    if (fileContent) {
      fileContent = addImports(fileContent, 'Config', '../shared/model/config/config.model');
      tree.overwrite(module, formatTsFile(fileContent));
    }

    return tree;
  };
}

export function configModule(options: IConfigOptions): Rule {
  if (!options.path) {
    options.path = '.';
  }

  return (host: Tree): Rule => {
    options.name = JSON.parse(host.read((options.path || '.') + '/package.json')!.toString('utf-8')).name;

    return chain([
      (host: Tree): Tree => {
        if (host.exists(join(options.path as Path, 'src/app/shared/logger/winston.logger.ts'))) {
          host.delete(join(options.path as Path, 'src/app/shared/logger/winston.logger.ts'));
        }
        return host;
      },
      mergeWith(
        apply(url('./files'), [
          template({
            ...strings,
            ...options,
            packagesVersion,
          }),
          formatTsFiles(),
          move(options.path),
          mergeFiles(host),
        ]),
      ),
      addToModule(options.path),
      updateMain(options.path),
    ]);
  };
}
