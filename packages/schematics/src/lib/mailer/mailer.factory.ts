import { Rule, chain, Tree, mergeWith, apply, url, template, move, forEach } from '@angular-devkit/schematics';
import { join, Path } from '@angular-devkit/core';
import { ModuleFinder } from '@nestjs/schematics/utils/module.finder';
import { addPropToInterface, addToModuleDecorator } from '../../utils/ast-utils';
import { mergeDockerFiles } from '../../utils/merge';
import { packagesVersion } from '../packagesVersion';
import { existsConfigModule } from '../../utils/tree-utils';
import { addImports, addGetterToClass, addEntryToObjctLiteralVariable } from '../../utils/ast-utils';

interface IMailerOptions {
  path?: string;
}

const defaultMailerValues = `{
  mailOptions: {
    host: 'localhost',
    port: 1025,
    secure: false,
    tls: {
      rejectUnauthorized: false,
    },
  },
  emailFrom: 'noreply@example.com',
  hbsOptions: {
    templatesDir: join(__dirname, '../..', 'templates/views'),
    partialsDir: join(__dirname, '../..', 'templates/partials'),
    helpers: [],
  },
}`;

export function mailer(options: IMailerOptions): Rule {
  return (host: Tree): Rule => {
    const projectPath: string = options.path || '.';

    return chain([
      mergeWith(
        apply(url('./files'), [
          template({
            path: projectPath,
          }),
          move(projectPath as Path),
          forEach(mergeDockerFiles(host)),
        ]),
      ),
      updatePackageJson(projectPath),
      addMailerToProject(projectPath),
    ]);
  };
}

function updatePackageJson(path: string) {
  return (tree: Tree): Tree => {
    const packageJsonPath = join(path as Path, 'package.json');
    const packageJson = JSON.parse(tree.read(packageJsonPath)!.toString());

    packageJson.dependencies['@devon4node/mailer'] = packagesVersion.devon4nodeMailer;

    tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));

    return tree;
  };
}

function addMailerToProject(path: string) {
  return (tree: Tree): Tree => {
    const config = existsConfigModule(tree, path || '.');
    if (!config) {
      addMailerToCoreModule(path, tree, false);
      return tree;
    }

    addMailerToCoreModule(path, tree, true);
    updateConfigTypeFile(path, tree);
    updateConfigFiles(path, tree);
    updateConfigurationService(path, tree);

    return tree;
  };
}

function addMailerToCoreModule(path: string, tree: Tree, existsConfig: boolean) {
  const core = new ModuleFinder(tree).find({
    name: 'core',
    path: join(path as Path, 'src/app/core') as Path,
  });
  if (!core) {
    return;
  }

  let coreContent: string | undefined = tree.read(core)!.toString();

  if (coreContent.includes('MailerModule')) {
    return;
  }

  if (existsConfig) {
    coreContent = addImports(coreContent, 'ConfigurationService', './configuration/services');
    coreContent = addToModuleDecorator(
      coreContent,
      'CoreModule',
      '@devon4node/mailer',
      `MailerModule.forRootAsync({
        imports: [ConfigurationModule],
        useFactory: (config: ConfigurationService) => {
          return config.mailerConfig;
        },
        inject: [ConfigurationService],
      })`,
      'imports',
      true,
    );
  } else {
    coreContent = addToModuleDecorator(
      coreContent,
      'CoreModule',
      '@devon4node/mailer',
      'MailerModule.forRoot(' + defaultMailerValues + ')',
      'imports',
      true,
    );
  }

  if (coreContent) {
    tree.overwrite(core, coreContent);
  }
}

function updateConfigurationService(project: string, tree: Tree) {
  const configServicePath = join(project as Path, 'src/app/core/configuration/services/configuration.service.ts');

  let configServiceContent = tree.read(configServicePath)!.toString();
  configServiceContent = addImports(configServiceContent, 'MailerModuleOptions', '@devon4node/mailer');
  configServiceContent = addGetterToClass(
    configServiceContent,
    'ConfigurationService',
    'mailerConfig',
    'MailerModuleOptions',
    'return this.get("mailerConfig")!;',
  );

  tree.overwrite(configServicePath, configServiceContent);
}

function updateConfigTypeFile(project: string | undefined, tree: Tree) {
  const typesFile: Path = join((project || '.') as Path, 'src/app/core/configuration/model/types.ts');

  let typesFileContent = tree.read(typesFile)!.toString('utf-8');
  typesFileContent = addImports(typesFileContent, 'MailerModuleOptions', '@devon4node/mailer');
  typesFileContent = addPropToInterface(typesFileContent, 'IConfig', 'mailerConfig', 'MailerModuleOptions');

  tree.overwrite(typesFile, typesFileContent);
}

function updateConfigFiles(project: string | undefined, tree: Tree) {
  const configDir: Path = join((project || '.') as Path, 'src/config');

  tree.getDir(configDir).subfiles.forEach(file => {
    let fileContent = tree.read(join(configDir, file))!.toString('utf-8');
    fileContent = addImports(fileContent, 'join', 'path');

    fileContent = addEntryToObjctLiteralVariable(fileContent, 'def', 'mailerConfig', defaultMailerValues);

    tree.overwrite(join(configDir, file), fileContent);
  });
}
