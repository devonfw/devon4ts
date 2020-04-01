import { join, Path } from '@angular-devkit/core';
import { apply, chain, mergeWith, move, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics/dist/utils/module.finder';
import {
  addEntryToObjctLiteralVariable,
  addImports,
  addPropToClass,
  addToModuleDecorator,
  addDecoratorToClassProp,
} from '../../utils/ast-utils';
import { mergeFiles } from '../../utils/merge';
import { existsConfigModule, formatTsFile } from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';

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

function addMailerToCoreModule(path: string, tree: Tree, existsConfig: boolean): void {
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
    coreContent = addImports(coreContent, 'ConfigService', '@devon4node/config');
    coreContent = addToModuleDecorator(
      coreContent,
      'CoreModule',
      '@devon4node/mailer',
      `MailerModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (config: ConfigService<Config>) => {
          return config.values.mailerConfig;
        },
        inject: [ConfigService],
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
    tree.overwrite(core, formatTsFile(coreContent));
  }
}

function updateConfigTypeFile(project: string | undefined, tree: Tree): void {
  const typesFile: Path = join((project || '.') as Path, 'src/app/shared/model/config/config.model.ts');

  let typesFileContent = tree.read(typesFile)!.toString('utf-8');
  typesFileContent = addImports(typesFileContent, 'MailerModuleOptions', '@devon4node/mailer');
  typesFileContent = addImports(typesFileContent, 'IsDefined', 'class-validator');
  typesFileContent = addImports(typesFileContent, 'IsNotEmptyObject', 'class-validator');
  typesFileContent = addPropToClass(typesFileContent, 'Config', 'mailerConfig', 'MailerModuleOptions', 'exclamation');
  typesFileContent = addDecoratorToClassProp(typesFileContent, 'Config', 'database', [
    { name: 'IsDefined', arguments: [] },
    { name: 'IsNotEmptyObject', arguments: [] },
  ]);

  tree.overwrite(typesFile, formatTsFile(typesFileContent));
}

function updateConfigFiles(project: string | undefined, tree: Tree): void {
  const configDir: Path = join((project || '.') as Path, 'src/config');

  tree.getDir(configDir).subfiles.forEach(file => {
    let fileContent = tree.read(join(configDir, file))!.toString('utf-8');
    fileContent = addImports(fileContent, 'join', 'path');

    fileContent = addEntryToObjctLiteralVariable(fileContent, 'def', 'mailerConfig', defaultMailerValues);

    tree.overwrite(join(configDir, file), formatTsFile(fileContent));
  });
}

function addMailerToProject(path: string): Rule {
  return (tree: Tree): Tree => {
    const config = existsConfigModule(tree, path || '.');
    if (!config) {
      addMailerToCoreModule(path, tree, false);
      return tree;
    }

    addMailerToCoreModule(path, tree, true);
    updateConfigTypeFile(path, tree);
    updateConfigFiles(path, tree);

    return tree;
  };
}

export function mailer(options: IMailerOptions): Rule {
  return (host: Tree): Rule => {
    const projectPath: string = options.path || '.';

    return chain([
      mergeWith(
        apply(url('./files'), [
          template({
            path: projectPath,
            packagesVersion,
          }),
          move(projectPath as Path),
          mergeFiles(host),
        ]),
      ),
      addMailerToProject(projectPath),
    ]);
  };
}
