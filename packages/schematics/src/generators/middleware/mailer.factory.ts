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
    templatesDir: join(__dirname, '../../..', 'templates/views'),
    partialsDir: join(__dirname, '../../..', 'templates/partials'),
    helpers: [],
  },
}`;

const mailerValuesFromConfig = `{
  mailOptions: {
    host: config.mailer.mailOptions.host,
    port: config.mailer.mailOptions.port,
    secure: config.mailer.mailOptions.secure,
    tls: {
      rejectUnauthorized: config.mailer.mailOptions.tlsRejectUnauthorized,
    },
  },
  emailFrom: config.mailer.emailFrom,
  hbsOptions: {
    templatesDir: join(__dirname, '../../..', config.mailer.hbsOptions.templatesDir),
    partialsDir: join(__dirname, '../../..', config.mailer.hbsOptions.partialsDir),
    helpers: [],
  },
}`;

const mailerConfigType = `{
  mailOptions: {
    host: {
      doc: 'Mail server host URL',
      default: 'localhost',
      format: String,
      env: 'MAILER_HOST',
    },
    port: {
      doc: 'Mail server port',
      default: 1025,
      format: 'port',
      env: 'MAILER_PORT',
    },
    secure: {
      doc: 'Is the mailer server secured?',
      default: false,
      format: Boolean,
      env: 'MAILER_SECURE',
    },
    tlsRejectUnauthorized: {
      doc: 'Reject unauthorized TLS connections?',
      default: false,
      format: Boolean,
      env: 'MAILER_TLS_REJECT_UNAUTHORIZED',
    },
  },
  emailFrom: {
    doc: 'Email that will be used as sender',
    default: 'noreply@example.com',
    format: String,
    env: 'MAILER_EMAIL_FROM',
    arg: 'emailFrom',
  },
  hbsOptions: {
    templatesDir: {
      doc: 'Relative path to handlebars views folder',
      default: 'templates/views',
      format: String,
    },
    partialsDir: {
      doc: 'Relative path to handlebars partials folder',
      default: 'templates/partials',
      format: String,
    },
  },
}`;

function addMailerToCoreModule(tree: Tree, existsConfig: boolean): void {
  const core = new ModuleFinder(tree).find({
    name: 'core',
    path: 'src/app/core' as Path,
  });
  if (!core) {
    return;
  }

  const coreContent: ASTFileBuilder | undefined = new ASTFileBuilder(tree.read(core)!.toString());

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
    tree.overwrite(core, formatTsFile(coreContent.build()));
  }
}

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
