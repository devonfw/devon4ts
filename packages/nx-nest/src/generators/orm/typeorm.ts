import { Tree, addDependenciesToPackageJson } from '@nx/devkit';
import * as path from 'path';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { ensureConfigFile } from '../../utils/config/config-defaults';
import { existsConvictConfig, getNpmScope } from '../../utils/tree-utils';
import { packagesVersion, packagesVersionLibs } from '../packagesVersion';
import { databaseConvictOptions, databaseConvictTypes, defaultDatabaseConvictOptions } from './convict-typeorm-options';
import { InitTypeormGeneratorSchema, dbType } from './schema';

const defaultTypeormConfig: Record<string, string> = {
  mysql: `type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'test',
  password: 'test',
  database: 'test',`,
  mariadb: `type: 'mariadb',
  host: 'localhost',
  port: 3306,
  username: 'test',
  password: 'test',
  database: 'test',`,
  sqlite: `type: 'sqlite',
  database: ':memory:',`,
  postgres: `type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'test',
  password: 'test',
  database: 'test',`,
  cockroachdb: `type: 'cockroachdb',
  host: 'localhost',
  port: 26257,
  username: 'root',
  password: '',
  database: 'defaultdb',`,
  mssql: `type: 'mssql',
  host: 'localhost',
  username: 'sa',
  password: 'Admin12345',
  database: 'tempdb',`,
  oracle: `type: 'oracle',
  host: 'localhost',
  port: 1521,
  username: 'system',
  password: 'oracle',
  sid: 'xe.oracle.docker',`,
  mongodb: `type: 'mongodb',
  database: 'test',`,
};

const dbPackage: Record<dbType, packagesVersionLibs> = {
  cockroachdb: 'postgres',
  mariadb: 'mysql2',
  mongodb: 'mongodb',
  mssql: 'mssql',
  mysql: 'mysql2',
  oracle: 'oracle',
  postgres: 'postgres',
  sqlite: 'sqlite',
};

export function generateTypeormConfiguration(
  tree: Tree,
  options: InitTypeormGeneratorSchema,
  projectRoot: string,
): void {
  addDependenciesToPackageJson(
    tree,
    {
      [packagesVersion.typeorm.name]: packagesVersion.typeorm.version,
      [packagesVersion.nestjsTypeorm.name]: packagesVersion.nestjsTypeorm.version,
      [packagesVersion.classTransformer.name]: packagesVersion.classTransformer.version,
      [packagesVersion.classValidator.name]: packagesVersion.classValidator.version,
      [packagesVersion[dbPackage[options.db]].name]: packagesVersion[dbPackage[options.db]].version,
    },
    {},
  );
  addTypeormToCoreModule(tree, projectRoot, options.db);
  addDatabaseConfiguration(tree, options, projectRoot);
}

function addTypeormToCoreModule(tree: Tree, projectRoot: string, database: string): void {
  const corePath = path.join(projectRoot, 'src/app/core/core.module.ts');
  if (!tree.exists(corePath)) {
    return;
  }

  let fileContent: ASTFileBuilder | undefined = new ASTFileBuilder(tree.read(corePath)!.toString('utf-8'));

  if (fileContent.build().includes('TypeOrmModule.forRoot')) {
    return;
  }

  fileContent = fileContent.addImports('TypeOrmModule', '@nestjs/typeorm').addImports('AppConfig', '../app-config');

  if (existsConvictConfig(tree, projectRoot)) {
    fileContent.addToModuleDecorator(
      'CoreModule',
      `TypeOrmModule.forRootAsync({
        useFactory: (config: AppConfig) => ({...config.database, entities: [], migrations: [], subscribers: [],}),
        inject: [CONFIG_PROVIDER],
      })`,
      'imports',
    );
  } else {
    fileContent.addToModuleDecorator(
      'CoreModule',
      `TypeOrmModule.forRoot({
        ${defaultTypeormConfig[database]}
        entities: [],
        migrations: [],
        subscribers: [],
      })`,
      'imports',
    );
  }

  if (fileContent) {
    tree.write(corePath, fileContent.build());
  }
}

function addDatabaseConfiguration(tree: Tree, options: InitTypeormGeneratorSchema, projectRoot: string): void {
  const config = existsConvictConfig(tree, projectRoot);
  if (!config) {
    return;
  }
  ensureConfigFile(tree, projectRoot, getNpmScope(tree));
  updateConfigFile(tree, options.db, projectRoot);
  updateConfigTypeFile(tree, options.db, projectRoot);
}

function updateConfigFile(tree: Tree, database: string, projectRoot: string): void {
  const typesFile = path.join(projectRoot, 'src/config.ts');

  const typesFileContent = new ASTFileBuilder(tree.read(typesFile)!.toString('utf-8'))
    .addPropertyToDefaultExportObjectLiteralParam(
      0,
      'database',
      `{
      ${databaseConvictOptions[database]}
      ${defaultDatabaseConvictOptions},
    }`,
    )
    .build();
  tree.write(typesFile, typesFileContent);
}

function updateConfigTypeFile(tree: Tree, database: string, projectRoot: string): void {
  const typesFile = path.join(projectRoot, 'src/app/app-config.ts');

  const typesFileContent = new ASTFileBuilder(tree.read(typesFile)!.toString('utf-8'))
    .addPropToInterface(
      'AppConfig',
      'database',
      `{
      ${databaseConvictTypes[database]}
      synchronize: boolean;
      migrationsRun: boolean;
      logging: boolean;
    }`,
    )
    .build();

  tree.write(typesFile, typesFileContent);
}
