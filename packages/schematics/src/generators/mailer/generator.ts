import {
  Tree,
  addDependenciesToPackageJson,
  generateFiles,
  installPackagesTask,
  readProjectConfiguration,
} from '@nx/devkit';
import * as path from 'path';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { existsConvictConfig } from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';
import { defaultMailerValues, mailerConfigType, mailerValuesFromConfig } from './configvalues';
import { MailerGeneratorSchema } from './schema';

export async function mailerGenerator(tree: Tree, options: MailerGeneratorSchema): Promise<() => void> {
  const appConfig = readProjectConfiguration(tree, options.projectName);
  addDependenciesToPackageJson(
    tree,
    {
      [packagesVersion['devon4tsMailer'].name]: packagesVersion['devon4tsMailer'].version,
      [packagesVersion['handlebars'].name]: packagesVersion['handlebars'].version,
    },
    {},
  );
  const projectRoot = appConfig.sourceRoot ?? 'src/';
  addMailerToProject(tree, projectRoot);
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  return () => {
    installPackagesTask(tree, false, '');
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

function addMailerToProject(tree: Tree, projectRoot: string): Tree {
  const config = existsConvictConfig(tree, projectRoot);

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
