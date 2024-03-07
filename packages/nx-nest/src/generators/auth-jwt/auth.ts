import {
  Tree,
  addDependenciesToPackageJson,
  formatFiles,
  generateFiles,
  installPackagesTask,
  readProjectConfiguration,
} from '@nx/devkit';
import * as path from 'path';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { ensureConfigFile } from '../../utils/config/config-defaults';
import { existsConvictConfig, getNpmScope } from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';
import { AuthJwtGeneratorSchema } from './schema';

export async function authJwtGenerator(tree: Tree, options: AuthJwtGeneratorSchema): Promise<() => void> {
  const appConfig = readProjectConfiguration(tree, options.projectName);
  const projectRoot = appConfig.root;
  addDependenciesToPackageJson(
    tree,
    {
      [packagesVersion['typeorm'].name]: packagesVersion['typeorm'].version,
      [packagesVersion['bcrypt'].name]: packagesVersion['bcrypt'].version,
      [packagesVersion['nestjsTypeorm'].name]: packagesVersion['nestjsTypeorm'].version,
      [packagesVersion['nestjsPassport'].name]: packagesVersion['nestjsPassport'].version,
      [packagesVersion['nestjsJwt'].name]: packagesVersion['nestjsJwt'].version,
      [packagesVersion['lodash'].name]: packagesVersion['lodash'].version,
      [packagesVersion['passport'].name]: packagesVersion['passport'].version,
      [packagesVersion['passportJwt'].name]: packagesVersion['passportJwt'].version,
    },
    {
      [packagesVersion['typesBcrypt'].name]: packagesVersion['typesBcrypt'].version,
      [packagesVersion['typesLodash'].name]: packagesVersion['typesLodash'].version,
      [packagesVersion['typesPassport'].name]: packagesVersion['typesPassport'].version,
      [packagesVersion['typesPassportJwt'].name]: packagesVersion['typesPassportJwt'].version,
    },
  );
  const config: boolean = existsConvictConfig(tree, projectRoot);
  if (config) {
    addJWTConfiguration(tree, projectRoot);
  }
  addAuthToCoreModule(tree, projectRoot);
  addUserEntityToDatasource(tree, projectRoot);
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    ...options,
    config,
  });
  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
  };
}

export default authJwtGenerator;

function addAuthToCoreModule(tree: Tree, projectRoot: string): void {
  const corePath = path.join(projectRoot, 'src/app/core/core.module.ts');
  if (!tree.exists(corePath)) {
    return;
  }

  const fileContent = new ASTFileBuilder(tree.read(corePath)!.toString('utf-8'))
    .addImports('AuthModule', './auth/auth.module')
    .addImports('UserModule', './user/user.module')
    .addToModuleDecorator('CoreModule', 'AuthModule', 'imports')
    ?.addToModuleDecorator('CoreModule', 'AuthModule', 'exports')
    ?.addToModuleDecorator('CoreModule', 'UserModule', 'imports')
    ?.addToModuleDecorator('CoreModule', 'UserModule', 'exports')
    ?.build();

  if (fileContent) {
    tree.write(corePath, fileContent);
  }
}

function addJWTConfiguration(tree: Tree, projectRoot: string): void {
  ensureConfigFile(tree, projectRoot, getNpmScope(tree));
  const configFile = path.join(projectRoot, 'src/config.ts');
  const configFileContent = new ASTFileBuilder(tree.read(configFile)!.toString('utf-8'))
    .addPropertyToDefaultExportObjectLiteralParam(
      0,
      'jwt',
      `{
      secret: {
        doc: 'JWT secret',
        format: String,
        default: 'SECRET',
        env: 'JWT_SECRET',
        arg: 'jwtSecret',
        secret: true,
      },
      expiration: {
        doc: 'Token expiration time',
        default: '24h',
        format: String,
        env: 'JWT_EXPIRATION',
      }
    }`,
    )
    .build();
  tree.write(configFile, configFileContent);

  const typesFile = path.join(projectRoot, 'src/app/app-config.ts');
  const typesFileContent = new ASTFileBuilder(tree.read(typesFile)!.toString('utf-8'))
    .addPropToInterface('AppConfig', 'jwt', `{secret: string; expiration: string;}`)
    .build();
  tree.write(typesFile, typesFileContent);
}

function addUserEntityToDatasource(tree: Tree, projectRoot: string): void {
  const filePath = path.join(projectRoot, 'src/app/shared/database/main-data-source.ts');
  const dataSourceContent = tree.read(filePath)?.toString('utf-8');
  if (!dataSourceContent) {
    return;
  }
  const updatedDataSource = new ASTFileBuilder(dataSourceContent)
    .addImports('User', '../../core/user/model/entities/user.entity')
    .addPropertyToObjectLiteralParam('AppDataSource', 0, 'entities', ['User'])
    .build();
  if (updatedDataSource) {
    tree.write(filePath, updatedDataSource);
  }
}
