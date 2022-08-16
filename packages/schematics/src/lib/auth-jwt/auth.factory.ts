import { Path, strings } from '@angular-devkit/core';
import { apply, chain, mergeWith, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics/dist/utils/module.finder';
import { noop } from 'rxjs';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { mergeFiles } from '../../utils/merge';
import {
  existsConvictConfig,
  formatTsFile,
  formatTsFiles,
  installNodePackages,
  stopExecutionIfNotRunningAtRootFolder,
} from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';

function addAuthToCoreModule(): Rule {
  return (tree: Tree): Tree => {
    const module = new ModuleFinder(tree).find({
      name: 'core',
      path: 'src/app/core/' as Path,
    });
    if (!module) {
      return tree;
    }

    const fileContent = new ASTFileBuilder(tree.read(module)!.toString('utf-8'))
      .addImports('AuthModule', './auth/auth.module')
      .addImports('UserModule', './user/user.module')
      .addToModuleDecorator('CoreModule', 'AuthModule', 'imports')
      ?.addToModuleDecorator('CoreModule', 'AuthModule', 'exports')
      ?.addToModuleDecorator('CoreModule', 'UserModule', 'imports')
      ?.addToModuleDecorator('CoreModule', 'UserModule', 'exports')
      ?.build();

    if (fileContent) {
      tree.overwrite(module, formatTsFile(fileContent));
    }

    return tree;
  };
}

function updateConfigTypeFile(tree: Tree): void {
  const typesFile: Path = 'src/config.ts' as Path;

  const typesFileContent = new ASTFileBuilder(tree.read(typesFile)!.toString('utf-8'))
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

  tree.overwrite(typesFile, formatTsFile(typesFileContent));
}

function addJWTConfiguration(): Rule {
  return (tree: Tree): Tree => {
    updateConfigTypeFile(tree);

    return tree;
  };
}

function deleteConfigFiles(): Rule {
  return (tree: Tree) => {
    tree.delete('config/develop.json');
    tree.delete('config/prod.json');

    return tree;
  };
}

function addUserEntityToDatasource(): Rule {
  return tree => {
    const filePath = 'src/app/shared/database/main-data-source.ts';
    const dataSourceContent = tree.read(filePath)?.toString();

    if (!dataSourceContent) {
      return tree;
    }

    const updatedDataSource = new ASTFileBuilder(dataSourceContent)
      .addImports('User', '../../core/user/model/entities/user.entity')
      .addPropertyToObjectLiteralParam('AppDataSource', 0, 'entities', ['User'])
      .build();

    if (updatedDataSource) {
      tree.overwrite(filePath, updatedDataSource);
    }

    return tree;
  };
}

export function authJWT(): Rule {
  return (tree: Tree): Rule => {
    const config: boolean = existsConvictConfig(tree);
    return chain([
      stopExecutionIfNotRunningAtRootFolder(),
      mergeWith(
        apply(url('./files'), [
          template({
            ...strings,
            config,
            packagesVersion,
          }),
          formatTsFiles(),
          !config ? deleteConfigFiles() : noop,
          mergeFiles(tree),
        ]),
      ),
      addAuthToCoreModule(),
      config ? addJWTConfiguration() : noop,
      addUserEntityToDatasource(),
      installNodePackages(),
    ]);
  };
}
