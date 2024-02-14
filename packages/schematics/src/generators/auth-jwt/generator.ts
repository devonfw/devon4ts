import {
  formatFiles,
  generateFiles,
  installPackagesTask,
  Tree,
  addDependenciesToPackageJson,
  updateJson,
} from '@nx/devkit';
import * as path from 'path';
import { AuthJwtGeneratorSchema } from './schema';
import { existsConvictConfig } from '../../utils/tree-utils';
import { ASTFileBuilder } from '../../utils/ast-file-builder';

export async function authJwtGenerator(tree: Tree, options: AuthJwtGeneratorSchema): Promise<() => void> {
  const projectRoot = `apps/${options.projectName}`;
  addDependenciesToPackageJson(
    tree,
    {
      'typeorm': 'latest',
      'bcrypt': 'latest',
      '@nestjs/typeorm': 'latest',
      '@nestjs/jwt': 'latest',
      '@nestjs/passport': 'latest',
      '@nestjs/swagger': 'latest',
      'lodash': 'latest',
      'passport': 'latest',
      'passport-jwt': 'latest',
    },
    {
      '@types/bcrypt': 'latest',
      '@types/lodash': 'latest',
      '@types/passport': 'latest',
      '@types/passport-jwt': 'latest',
    },
  );
  const config: boolean = existsConvictConfig(tree, options.projectName);
  if (!config) {
    deleteConfigFiles(tree, projectRoot);
  } else {
    updateConfigFiles(tree, projectRoot);
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
    installPackagesTask(tree, false, '', 'pnpm');
  };
}

export default authJwtGenerator;

function updateConfigFiles(tree: Tree, projectRoot: string): void {
  const prodPath = path.join(projectRoot, 'config/prod.json');
  const developPath = path.join(projectRoot, 'config/develop.json');

  updateJson(tree, prodPath, content => {
    content.jwt = {
      secret: 'SECRET',
      expiration: '24h',
    };
    return content;
  });

  updateJson(tree, developPath, content => {
    content.jwt = {
      secret: 'SECRET',
      expiration: '24h',
    };
    return content;
  });
}

function deleteConfigFiles(tree: Tree, projectRoot: string): void {
  tree.delete(`${projectRoot}/config/develop.json`);
  tree.delete(`${projectRoot}/config/prod.json`);
}

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
  const configFile = path.join(projectRoot, 'src/config.ts');
  const configFileContent = new ASTFileBuilder(tree.read(configFile)!.toString('utf-8'))
    .addPropertyToObjectLiteralParam(
      'config',
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

  const typesFile = path.join(projectRoot, 'src/app/shared/app-config.ts');
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
