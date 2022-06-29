import { join, Path, strings } from '@angular-devkit/core';
import { apply, chain, mergeWith, move, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics/dist/utils/module.finder';
import { noop } from 'rxjs';
import { mergeFiles } from '../../utils/merge';
import { existsConfigModule, formatTsFile, formatTsFiles, installNodePackages } from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';
import { ASTFileBuilder } from '../../utils/ast-file-builder';

const defaultJwtConfig = {
  secret: 'SECRET',
  signOptions: { expiresIn: '24h' },
};

interface IAuthJWTOptions {
  path: string;
}

function addAuthToCoreModule(project: string): Rule {
  return (tree: Tree): Tree => {
    const module = new ModuleFinder(tree).find({
      name: 'core',
      path: join('.' as Path, project || '.', 'src/app/core/') as Path,
    });
    if (!module) {
      return tree;
    }

    const fileContent = new ASTFileBuilder(tree.read(module)!.toString('utf-8'))
      .addToModuleDecorator('CoreModule', './auth/auth.module', 'AuthModule', 'imports', true)
      ?.addToModuleDecorator('CoreModule', './user/user.module', 'UserModule', 'imports', true)
      ?.build();

    if (fileContent) {
      tree.overwrite(module, formatTsFile(fileContent));
    }

    return tree;
  };
}

function updateConfigTypeFile(project: string | undefined, tree: Tree): void {
  const typesFile: Path = join((project || '.') as Path, 'src/app/shared/model/config/config.model.ts');

  const typesFileContent = new ASTFileBuilder(tree.read(typesFile)!.toString('utf-8'))
    .addImports('JwtModuleOptions', '@nestjs/jwt')
    .addImports('IsDefined', 'class-validator')
    .addImports('IsNotEmptyObject', 'class-validator')
    .addPropToClass('Config', 'jwtConfig', 'JwtModuleOptions', 'exclamation')
    .addDecoratorToClassProp('Config', 'jwtConfig', [
      { name: 'IsDefined', arguments: [] },
      { name: 'IsNotEmptyObject', arguments: [] },
    ])
    .build();

  tree.overwrite(typesFile, formatTsFile(typesFileContent));
}

function updateConfigFiles(project: string | undefined, tree: Tree): void {
  const configDir: Path = join((project || '.') as Path, 'src/config');

  tree.getDir(configDir).subfiles.forEach(file => {
    tree.overwrite(
      join(configDir, file),
      formatTsFile(
        new ASTFileBuilder(tree.read(join(configDir, file))!.toString('utf-8'))
          .addEntryToObjctLiteralVariable('def', 'jwtConfig', JSON.stringify(defaultJwtConfig))
          .build(),
      ),
    );
  });
}

function addJWTConfiguration(project: string | undefined): Rule {
  return (tree: Tree): Tree => {
    updateConfigTypeFile(project, tree);
    updateConfigFiles(project, tree);

    return tree;
  };
}

export function authJWT(options: IAuthJWTOptions): Rule {
  return (tree: Tree): Rule => {
    if (!options.path) {
      options.path = '.';
    }
    options.path = strings.dasherize(options.path);
    const config: boolean = existsConfigModule(tree, options.path);
    return chain([
      mergeWith(
        apply(url('./files'), [
          template({
            ...strings,
            ...options,
            config,
            packagesVersion,
          }),
          formatTsFiles(),
          move(join((options.path || '.') as Path)),
          mergeFiles(tree),
        ]),
      ),
      // updatePackageJson(options.path),
      addAuthToCoreModule(options.path),
      config ? addJWTConfiguration(options.path) : noop,
      installNodePackages(),
    ]);
  };
}
