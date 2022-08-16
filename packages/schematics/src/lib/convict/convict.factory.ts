import { Path } from '@angular-devkit/core';
import { apply, chain, mergeWith, Rule, strings, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { mergeFiles } from '../../utils/merge';
import {
  formatTsFile,
  formatTsFiles,
  installNodePackages,
  stopExecutionIfNotRunningAtRootFolder,
} from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';

function updateMain(): Rule {
  return (tree: Tree): Tree => {
    let content = tree.read('/src/main.ts')?.toString('utf-8');

    if (!content) {
      return tree;
    }

    content = content.replace('await app.listen(3000);', 'await app.listen(config.port);');
    content = content.replace("defaultVersion: '1',", 'defaultVersion: config.defaultVersion,');

    content = new ASTFileBuilder(content).addDefaultImports('config', './config').build();

    if (content) {
      tree.overwrite('/src/main.ts', formatTsFile(content));
    }
    return tree;
  };
}

function updateLogger(): Rule {
  return (tree: Tree): Tree => {
    let content = tree.read('/src/app/shared/logger/winston.logger.ts')?.toString('utf-8');

    if (!content) {
      return tree;
    }

    content = content.replace(/oneLineStack\(\w*\),/g, 'oneLineStack(config.logger.oneLineStack),');
    content = content.replace(/colorize\(\w*\),/g, 'colorize(config.logger.color),');
    content = content.replace(/level:.*,/g, 'level: config.logger.loggerLevel,');

    content = new ASTFileBuilder(content).addDefaultImports('config', '../../../config').build();

    if (content) {
      tree.overwrite('/src/app/shared/logger/winston.logger.ts', formatTsFile(content));
    }

    return tree;
  };
}

function addConfigToCoreModule(): Rule {
  return (tree: Tree): Tree => {
    const module = new ModuleFinder(tree).find({
      name: 'core',
      path: 'src/app/core/' as Path,
    });
    if (!module) {
      return tree;
    }

    let fileContent: ASTFileBuilder | undefined = new ASTFileBuilder(tree.read(module)!.toString('utf-8'));

    if (fileContent.build().includes('provide: CONFIG_PROVIDER')) {
      return tree;
    }

    fileContent = fileContent
      .addImports('CONFIG_PROVIDER', '../../config')
      .addDefaultImports('config', '../../config')
      .addToModuleDecorator(
        'CoreModule',
        `{
          provide: CONFIG_PROVIDER,
          useValue: config,
        }`,
        'providers',
      );

    fileContent?.addToModuleDecorator('CoreModule', 'CONFIG_PROVIDER', 'exports');

    if (fileContent) {
      tree.overwrite(module, formatTsFile(fileContent.build()));
    }

    return tree;
  };
}

export function initConvict(): Rule {
  return (host: Tree): Rule => {
    return chain([
      stopExecutionIfNotRunningAtRootFolder(),
      mergeWith(
        apply(url('./files'), [
          template({
            ...strings,
            ...packagesVersion,
          }),
          formatTsFiles(),
          mergeFiles(host),
        ]),
      ),
      updateMain(),
      updateLogger(),
      addConfigToCoreModule(),
      installNodePackages(),
    ]);
  };
}
