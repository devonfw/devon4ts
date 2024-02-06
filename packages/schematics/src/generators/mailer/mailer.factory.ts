import { Path } from '@angular-devkit/core';
import { apply, chain, mergeWith, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics/dist/utils/module.finder';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { mergeFiles } from '../../utils/merge';
import {
  existsConvictConfig,
  formatTsFile,
  installNodePackages,
  stopExecutionIfNotRunningAtRootFolder,
} from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';
import { defaultMailerValues, mailerConfigType, mailerValuesFromConfig } from './configvalues';

// function addMailerToCoreModule(tree: Tree, existsConfig: boolean): void {
//   const core = new ModuleFinder(tree).find({
//     name: 'core',
//     path: 'src/app/core' as Path,
//   });
//   if (!core) {
//     return;
//   }

//   const coreContent: ASTFileBuilder | undefined = new ASTFileBuilder(tree.read(core)!.toString());

//   if (coreContent.build().includes('MailerModule')) {
//     return;
//   }

//   coreContent
//     .addImports('MailerModule', '@devon4ts_node/mailer')
//     .addImports('join', 'path')
//     .addToModuleDecorator(
//       'CoreModule',
//       'MailerModule.register(' + (existsConfig ? mailerValuesFromConfig : defaultMailerValues) + ')',
//       'imports',
//     )
//     ?.addToModuleDecorator('CoreModule', 'MailerModule', 'exports');

//   if (coreContent) {
//     tree.overwrite(core, formatTsFile(coreContent.build()));
//   }
// }

function updateConfigTypeFile(tree: Tree): void {
  const typesFile: Path = 'src/config.ts' as Path;

  const typesFileContent = new ASTFileBuilder(tree.read(typesFile)!.toString('utf-8'))
    .addPropertyToObjectLiteralParam('config', 0, 'mailer', mailerConfigType)
    .build();

  tree.overwrite(typesFile, formatTsFile(typesFileContent));
}

function addMailerToProject(): Rule {
  return (tree: Tree): Tree => {
    const config = existsConvictConfig(tree);
    if (!config) {
      addMailerToCoreModule(tree, false);
      return tree;
    }

    addMailerToCoreModule(tree, true);
    updateConfigTypeFile(tree);

    return tree;
  };
}

export function mailer(): Rule {
  return (host: Tree): Rule => {
    return chain([
      stopExecutionIfNotRunningAtRootFolder(),
      mergeWith(
        apply(url('./files'), [
          template({
            packagesVersion,
          }),
          mergeFiles(host),
        ]),
      ),
      addMailerToProject(),
      installNodePackages(),
    ]);
  };
}
