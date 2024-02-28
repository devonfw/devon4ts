import {
  addDependenciesToPackageJson,
  formatFiles,
  generateFiles,
  installPackagesTask,
  readProjectConfiguration,
  Tree,
  updateJson,
} from '@nx/devkit';
import * as path from 'path';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { existsConvictConfig } from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';
import { databaseConvictOptions, databaseConvictTypes, defaultDatabaseConvictOptions } from './convictOptions';
import { InitTypeormGeneratorSchema } from './schema';

export async function initTypeormGenerator(tree: Tree, options: InitTypeormGeneratorSchema): Promise<() => void> {
  const appConfig = readProjectConfiguration(tree, options.projectName);
  addDependenciesToPackageJson(
    tree,
    {
      [packagesVersion['typeorm'].name]: packagesVersion['typeorm'].version,
      [packagesVersion['nestjsTypeorm'].name]: packagesVersion['nestjsTypeorm'].version,
      [packagesVersion['classTransformer'].name]: packagesVersion['classTransformer'].version,
      [packagesVersion['classValidator'].name]: packagesVersion['classValidator'].version,
    },
    {},
  );
  const projectRoot = appConfig.root;
  addTypeormToCoreModule(tree, projectRoot);
  addDatabaseConfiguration(tree, options, projectRoot);

  const config = existsConvictConfig(tree, projectRoot);
  if (config) {
    addOrUpdateConfigJson(tree, projectRoot, options);
  }
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    ...options,
    config,
  });

  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
  };
}

export default initTypeormGenerator;

function addTypeormToCoreModule(tree: Tree, projectRoot: string): void {
  const corePath = path.join(projectRoot, 'src/app/core/core.module.ts');
  if (!tree.exists(corePath)) {
    return;
  }

  let fileContent: ASTFileBuilder | undefined = new ASTFileBuilder(tree.read(corePath)!.toString('utf-8'));

  if (fileContent.build().includes('TypeOrmModule.forRoot')) {
    return;
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
    tree.write(corePath, fileContent.build());
  }
}

function addDatabaseConfiguration(tree: Tree, options: InitTypeormGeneratorSchema, projectRoot: string): void {
  const config = existsConvictConfig(tree, projectRoot);
  if (!config) {
    return;
  }
  updateConfigFile(tree, options.db, projectRoot);
  updateConfigTypeFile(tree, options.db, projectRoot);
}

function updateConfigFile(tree: Tree, database: string, projectRoot: string): void {
  const typesFile = path.join(projectRoot, 'src/config.ts');

  const typesFileContent = new ASTFileBuilder(tree.read(typesFile)!.toString('utf-8'))
    .addPropertyToObjectLiteralParam(
      'config',
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
  const typesFile = path.join(projectRoot, 'src/app/shared/app-config.ts');

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
function addOrUpdateConfigJson(tree: Tree, projectRoot: string, options: InitTypeormGeneratorSchema): void {
  const developPath = path.join(projectRoot, 'src/config/develop.json');
  const prodPath = path.join(projectRoot, 'src/config/prod.json');
  const contentToWrite = getDb(options.db);
  if (tree.exists(developPath)) {
    // Update
    updateJson(tree, developPath, content => {
      content.database = contentToWrite;
      return content;
    });
  } else {
    // Create
    tree.write(developPath, JSON.stringify(contentToWrite));
  }
  if (tree.exists(prodPath)) {
    // Update
    updateJson(tree, prodPath, content => {
      content.database = contentToWrite;
      return content;
    });
  } else {
    // Create
    tree.write(prodPath, JSON.stringify(contentToWrite));
  }
}

function getDb(db: string): object {
  const config = {
    database: ((): object => {
      if (db === 'mysql') {
        return {
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'test',
          password: 'test',
          database: 'test',
        };
      } else if (db === 'mariadb') {
        return {
          type: 'mariadb',
          host: 'localhost',
          port: 3306,
          username: 'test',
          password: 'test',
          database: 'test',
        };
      } else if (db === 'sqlite') {
        return {
          type: 'sqlite',
          database: ':memory:',
        };
      } else if (db === 'postgres') {
        return {
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'test',
          password: 'test',
          database: 'test',
        };
      } else if (db === 'cockroachdb') {
        return {
          type: 'cockroachdb',
          host: 'localhost',
          port: 26257,
          username: 'root',
          password: '',
          database: 'defaultdb',
        };
      } else if (db === 'mssql') {
        return {
          type: 'mssql',
          host: 'localhost',
          username: 'sa',
          password: 'Admin12345',
          database: 'tempdb',
        };
      } else if (db === 'oracle') {
        return {
          type: 'oracle',
          host: 'localhost',
          port: 1521,
          username: 'system',
          password: 'oracle',
          sid: 'xe.oracle.docker',
        };
      } else if (db === 'mongodb') {
        return {
          type: 'mongodb',
          database: 'test',
        };
      } else {
        // Default configuration
        return {
          type: 'unknown',
          message: 'Database type not recognized',
        };
      }
    })(),
    synchronize: false,
    migrationsRun: true,
    logging: true,
  };
  return config;
}
