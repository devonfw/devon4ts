import { join, Path } from '@angular-devkit/core';
import { apply, chain, mergeWith, move, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics/dist/utils/module.finder';
import { mergeFiles } from '../../utils/merge';
import { existsConfigModule, formatTsFile, installNodePackages } from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';
import { ASTFileBuilder } from '../../utils/ast-file-builder';

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

  let coreContent: ASTFileBuilder | undefined = new ASTFileBuilder(tree.read(core)!.toString());

  if (coreContent.build().includes('MailerModule')) {
    return;
  }

  if (existsConfig) {
    coreContent = coreContent.addImports('ConfigService', '@devon4node/config').addToModuleDecorator(
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
    coreContent = coreContent
      .addImports('join', 'path')
      .addToModuleDecorator(
        'CoreModule',
        '@devon4node/mailer',
        'MailerModule.forRoot(' + defaultMailerValues + ')',
        'imports',
        true,
      );
  }

  if (coreContent) {
    tree.overwrite(core, formatTsFile(coreContent.build()));
  }
}

function updateConfigTypeFile(project: string | undefined, tree: Tree): void {
  const typesFile: Path = join((project || '.') as Path, 'src/app/shared/model/config/config.model.ts');

  const typesFileContent = new ASTFileBuilder(tree.read(typesFile)!.toString('utf-8'))
    .addImports('MailerModuleOptions', '@devon4node/mailer')
    .addImports('IsDefined', 'class-validator')
    .addImports('IsNotEmptyObject', 'class-validator')
    .addPropToClass('Config', 'mailerConfig', 'MailerModuleOptions', 'exclamation')
    .addDecoratorToClassProp('Config', 'mailerConfig', [
      { name: 'IsDefined', arguments: [] },
      { name: 'IsNotEmptyObject', arguments: [] },
    ])
    .build();

  tree.overwrite(typesFile, formatTsFile(typesFileContent));
}

function updateConfigFiles(project: string | undefined, tree: Tree): void {
  const configDir: Path = join((project || '.') as Path, 'src/config');

  tree.getDir(configDir).subfiles.forEach(file => {
    const fileContent = new ASTFileBuilder(tree.read(join(configDir, file))!.toString('utf-8'))
      .addImports('join', 'path')
      .addEntryToObjctLiteralVariable('def', 'mailerConfig', defaultMailerValues);

    tree.overwrite(join(configDir, file), formatTsFile(fileContent.build()));
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
      installNodePackages(),
    ]);
  };
}
