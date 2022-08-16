import { join, Path } from '@angular-devkit/core';
import { apply, chain, filter, mergeWith, noop, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics/dist/utils/module.finder';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { mergeFiles } from '../../utils/merge';
import {
  existsConvictConfig,
  formatTsFile,
  formatTsFiles,
  installNodePackages,
  runningAtRootFolder,
} from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';

const databaseConvictOptions: Record<string, string> = {
  mysql: `${printType('mysql')}
    ${printHost('localhost')}
    ${printPort(3306)}
    ${printUsername('test')}
    ${printPassword('test')}
    ${printDatabase('test')}`,
  mariadb: `${printType('mariadb')}
    ${printHost('localhost')}
    ${printPort(3306)}
    ${printUsername('test')}
    ${printPassword('test')}
    ${printDatabase('test')}`,
  sqlite: `${printType('sqlite')} ${printDatabase(':memory:')}`,
  postgres: `${printType('postgres')}
    ${printHost('localhost')}
    ${printPort(5432)}
    ${printUsername('test')}
    ${printPassword('test')}
    ${printDatabase('test')}`,
  cockroachdb: `${printType('cockroachdb')}
    ${printHost('localhost')}
    ${printPort(2625)},
    ${printUsername('root')}
    ${printPassword('')}
    ${printDatabase('defaultdb')}`,
  mssql: `${printType('mssql')}
    ${printHost('localhost')}
    ${printUsername('sa')}
    ${printPassword('Admin12345')}
    ${printDatabase('tempdb')}`,
  oracle: `${printType('oracle')}
    ${printHost('localhost')}
    ${printPort(1521)}
    ${printUsername('system')}
    ${printPassword('oracle')}
    ${printSID('xe.oracle.docker')}`,
  mongodb: `${printType('mongodb')} ${printDatabase('test')}`,
};

const defaultDatabaseConvictOptions = `synchronize: {
      doc: 'Do you want to synchronize database tables with you entities?',
      default: false,
      format: Boolean,
    },
    migrationsRun: {
      doc: 'Do you want to execute the migrations at application start?',
      default: true,
      format: Boolean,
    },
    logging: { doc: 'Do you want to log all database queries?', default: true, format: Boolean }`;

export interface ITypeormOptions {
  db: 'postgres' | 'cockroachdb' | 'mariadb' | 'mysql' | 'sqlite' | 'oracle' | 'mssql' | 'mongodb';
}

function printType(type: string): string {
  return `type: {
    doc: 'Database provider type',
    default: '${type}',
    format: ['postgres', 'cockroachdb', 'mariadb', 'mysql', 'sqlite', 'oracle', 'mssql', 'mongodb'],
    env: 'DATABASE_TYPE',
    arg: 'databaseType',
  },`;
}

function printHost(host: string): string {
  return `host: {
    doc: 'Database host URL',
    default: '${host}',
    format: String,
    env: 'DATABASE_HOST',
    arg: 'databaseHost',
  },`;
}

function printPort(port: number): string {
  return `port: {
    doc: 'Database port',
    default: ${port},
    format: 'port',
    env: 'DATABASE_PORT',
    arg: 'databasePort',
  },`;
}

function printUsername(username: string): string {
  return `username: {
    doc: 'Database connection username',
    default: '${username}',
    format: String,
    env: 'DATABASE_USERNAME',
    arg: 'databaseUsername',
  },`;
}

function printPassword(password: string): string {
  return `password: {
    doc: 'Database connection password',
    default: '${password}',
    format: String,
    secret: true,
    env: 'DATABASE_PASSWORD',
    arg: 'databasePassword',
  },`;
}

function printDatabase(database: string): string {
  return `database: {
    doc: 'Database connection schema',
    default: '${database}',
    format: String,
    env: 'DATABASE_DATABASE',
    arg: 'databaseDatabase',
  },`;
}

function printSID(sid: string): string {
  return `sid: {
    doc: 'Database connection SID',
    default: '${sid}',
    format: String,
    env: 'DATABASE_SID',
    arg: 'databaseSid',
  },`;
}

function addTypeormToCoreModule(): Rule {
  return (tree: Tree): Tree => {
    const module = new ModuleFinder(tree).find({
      name: 'core',
      path: 'src/app/core/' as Path,
    });
    if (!module) {
      return tree;
    }

    let fileContent: ASTFileBuilder | undefined = new ASTFileBuilder(tree.read(module)!.toString('utf-8'));

    if (fileContent.build().includes('TypeOrmModule.forRoot')) {
      return tree;
    }

    fileContent = fileContent
      .addImports('AppDataSource', '../shared/database/main-data-source')
      .addImports('TypeOrmModule', '@nestjs/typeorm')
      .addToModuleDecorator(
        'CoreModule',
        `TypeOrmModule.forRootAsync({
          useFactory: () => ({}),
          dataSourceFactory: async () => AppDataSource,
        })`,
        'imports',
      );

    if (fileContent) {
      tree.overwrite(module, formatTsFile(fileContent.build()));
    }

    return tree;
  };
}

function updateConfigTypeFile(tree: Tree, database: string, project?: string): void {
  const typesFile: Path = join((project || '.') as Path, 'src/config.ts');

  const typesFileContent = new ASTFileBuilder(tree.read(typesFile)!.toString('utf-8')).addPropertyToObjectLiteralParam(
    'config',
    0,
    'database',
    `{
      ${databaseConvictOptions[database]}
      ${defaultDatabaseConvictOptions},
    }`,
  );

  tree.overwrite(typesFile, formatTsFile(typesFileContent.build()));
}

function addDatabaseConfiguration(database: string, project?: string): Rule {
  return (tree: Tree): Tree => {
    const config = existsConvictConfig(tree);
    if (!config) {
      return tree;
    }

    updateConfigTypeFile(tree, database, project);

    return tree;
  };
}

export function initTypeorm(options: ITypeormOptions): Rule {
  return (tree: Tree): Rule => {
    if (!runningAtRootFolder(tree)) {
      return noop();
    }

    const config = existsConvictConfig(tree);

    return chain([
      mergeWith(
        apply(url('./files'), [
          config ? noop() : filter(filePath => !filePath.startsWith('/config')),
          template({
            ...options,
            packagesVersion,
            config,
          }),
          formatTsFiles(),
          mergeFiles(tree),
        ]),
      ),
      addTypeormToCoreModule(),
      addDatabaseConfiguration(options.db),
      installNodePackages(),
    ]);
  };
}
