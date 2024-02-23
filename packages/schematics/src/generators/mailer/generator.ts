import { addDependenciesToPackageJson, installPackagesTask, Tree, generateFiles } from '@nx/devkit';
import * as path from 'path';
import { MailerGeneratorSchema } from './schema';
import { existsConvictConfig, stopExecutionIfNotRunningAtRootFolder } from '../../utils/tree-utils';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { defaultMailerValues, mailerConfigType, mailerValuesFromConfig } from './configvalues';
import { packagesVersion } from '../packagesVersion';

export async function mailerGenerator(tree: Tree, options: MailerGeneratorSchema): Promise<() => void> {
  stopExecutionIfNotRunningAtRootFolder(tree);
  addDependenciesToPackageJson(
    tree,
    {
      [packagesVersion['devon4tsMailer'].name]: packagesVersion['devon4tsMailer'].version,
      [packagesVersion['handlebars'].name]: packagesVersion['handlebars'].version,
    },
    {},
  );
  const projectRoot = `apps/${options.projectName}/src`;
  addMailerToProject(tree, options, projectRoot);
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  return () => {
    installPackagesTask(tree, false, '', 'pnpm');
  };
}

export default mailerGenerator;

function addMailerToCoreModule(tree: Tree, existsConfig: boolean, projectRoot: string): void {
  const corePath = `${projectRoot}/app/core/core.module.ts`;
  if (!tree.exists(corePath)) {
    return;
  }

  const coreContent = new ASTFileBuilder(tree.read(corePath)!.toString());

  if (coreContent.build().includes('MailerModule')) {
    return;
  }

  coreContent
    .addImports('MailerModule', '@devon4ts/mailer')
    .addImports('join', 'path')
    .addToModuleDecorator(
      'CoreModule',
      'MailerModule.register(' + (existsConfig ? mailerValuesFromConfig : defaultMailerValues) + ')',
      'imports',
    )
    ?.addToModuleDecorator('CoreModule', 'MailerModule', 'exports');

  if (coreContent) {
    tree.write(corePath, coreContent.build());
  }
}

function addMailerToProject(tree: Tree, options: MailerGeneratorSchema, projectRoot: string): Tree {
  const config = existsConvictConfig(tree, options.projectName);

  if (!config) {
    addMailerToCoreModule(tree, false, projectRoot);
    return tree;
  }

  addMailerToCoreModule(tree, true, projectRoot);
  const typesFile = `${projectRoot}/config.ts`;

  const typesFileContent = new ASTFileBuilder(tree.read(typesFile)!.toString('utf-8'))
    .addPropertyToObjectLiteralParam('config', 0, 'mailer', mailerConfigType)
    .build();

  tree.write(typesFile, typesFileContent);

  return tree;
}
