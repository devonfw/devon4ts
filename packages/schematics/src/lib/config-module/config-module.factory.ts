import { join, Path, strings } from '@angular-devkit/core';
import { apply, chain, mergeWith, move, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics/dist/utils/module.finder';
import { mergeFiles } from '../../utils/merge';
import { formatTsFile, formatTsFiles, installNodePackages } from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';
import { ASTFileBuilder } from '../../utils/ast-file-builder';

interface IConfigOptions {
  name: string;
  path: string;
}

function updateMain(project: string): Rule {
  return (tree: Tree): Tree => {
    let content = tree.read((project || '.') + '/src/main.ts')!.toString('utf-8');
    content = content.replace('await app.listen(3000);', 'await app.listen(configModule.values.port);');
    content = content.replace("defaultVersion: '1',", 'defaultVersion: configModule.values.defaultVersion,');

    content = new ASTFileBuilder(content)
      .insertLinesToFunctionAfter(
        'bootstrap',
        'NestFactory.create',
        'const configModule = app.get<ConfigService<Config>>(ConfigService);',
      )
      .addImports('ConfigService', '@devon4node/config')
      .addImports('Config', './app/shared/model/config/config.model')
      .build();

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

    const fileContent = new ASTFileBuilder(tree.read(module)!.toString('utf-8'))
      .addToModuleDecorator(
        'CoreModule',
        '@devon4node/config',
        `ConfigModule.register({
        configType: Config,
      })`,
        'imports',
        true,
      )
      ?.addImports('Config', '../shared/model/config/config.model')
      .build();

    if (fileContent) {
      tree.overwrite(module, formatTsFile(fileContent));
    }

    return tree;
  };
}

export function configModule(options: IConfigOptions): Rule {
  if (!options.path) {
    options.path = '.';
  }
  options.path = strings.dasherize(options.path);

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
      installNodePackages(),
    ]);
  };
}
