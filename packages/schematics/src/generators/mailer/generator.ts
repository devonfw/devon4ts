import { addDependenciesToPackageJson, formatFiles, generateFiles, installPackagesTask, Tree } from '@nx/devkit';
import * as path from 'path';
import { MailerGeneratorSchema } from './schema';
import { existsConvictConfig, ModuleFinder } from '../../utils/tree-utils';
import { Path } from '@angular-devkit/core';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { defaultMailerValues, mailerConfigType, mailerValuesFromConfig } from './configvalues';

export async function mailerGenerator(tree: Tree, options: MailerGeneratorSchema): Promise<void> {
  addDependenciesToPackageJson(tree, { '@devon4ts_node/mailer': 'latest' }, {});
  const projectRoot = `apps/${options.projectName}/src`;
  addMailerToProject(tree, options, projectRoot);
  // addProjectConfiguration(tree, options.projectName, {
  //   root: projectRoot,
  //   projectType: 'library',
  //   sourceRoot: `${projectRoot}/src`,
  //   targets: {},
  // });
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  installPackagesTask(tree, false, '', 'pnpm');
  await formatFiles(tree);
}

export default mailerGenerator;

function addMailerToCoreModule(tree: Tree, existsConfig: boolean): void {
  const core = new ModuleFinder(tree).find({
    name: 'core',
    path: 'src/app/core' as Path,
  });
  if (!core) {
    return;
  }

  let coreContent = new ASTFileBuilder(tree.read(core)!.toString());

  if (coreContent.build().includes('MailerModule')) {
    return;
  }

  coreContent
    .addImports('MailerModule', '@devon4ts_node/mailer')
    .addImports('join', 'path')
    .addToModuleDecorator(
      'CoreModule',
      'MailerModule.register(' + (existsConfig ? mailerValuesFromConfig : defaultMailerValues) + ')',
      'imports',
    )
    ?.addToModuleDecorator('CoreModule', 'MailerModule', 'exports');

  if (coreContent) {
    tree.write(core, coreContent.build());
  }
}

function addMailerToProject(tree: Tree, options: MailerGeneratorSchema, projectRoot: string): Tree {
  const config = existsConvictConfig(tree, options.projectName);

  if (!config) {
    addMailerToCoreModule(tree, false);
    return tree;
  }

  addMailerToCoreModule(tree, true);
  const typesFile: Path = `${projectRoot}/config.ts` as Path;

  const typesFileContent = new ASTFileBuilder(tree.read(typesFile)!.toString('utf-8'))
    .addPropertyToObjectLiteralParam('config', 0, 'mailer', mailerConfigType)
    .build();

  tree.write(typesFile, typesFileContent);

  return tree;
}
