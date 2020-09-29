import { join, Path, strings } from '@angular-devkit/core';
import { apply, chain, mergeWith, move, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics/dist/utils/module.finder';
import { noop } from 'rxjs';
import {
  addDecoratorToClassProp,
  addEntryToObjctLiteralVariable,
  addImports,
  addPropToClass,
  addToModuleDecorator,
} from '../../utils/ast-utils';
import { mergeFiles } from '../../utils/merge';
import { existsConfigModule, formatTsFile, formatTsFiles } from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';

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

    let fileContent = addToModuleDecorator(
      tree.read(module)!.toString('utf-8'),
      'CoreModule',
      './auth/auth.module',
      'AuthModule',
      'imports',
      true,
    );

    fileContent = addToModuleDecorator(fileContent!, 'CoreModule', './user/user.module', 'UserModule', 'imports', true);

    if (fileContent) {
      tree.overwrite(module, formatTsFile(fileContent));
    }

    return tree;
  };
}

function updateConfigTypeFile(project: string | undefined, tree: Tree): void {
  const typesFile: Path = join((project || '.') as Path, 'src/app/shared/model/config/config.model.ts');

  let typesFileContent = tree.read(typesFile)!.toString('utf-8');
  typesFileContent = addImports(typesFileContent, 'JwtModuleOptions', '@nestjs/jwt');
  typesFileContent = addImports(typesFileContent, 'IsDefined', 'class-validator');
  typesFileContent = addImports(typesFileContent, 'IsNotEmptyObject', 'class-validator');
  typesFileContent = addPropToClass(typesFileContent, 'Config', 'jwtConfig', 'JwtModuleOptions', 'exclamation');
  typesFileContent = addDecoratorToClassProp(typesFileContent, 'Config', 'jwtConfig', [
    { name: 'IsDefined', arguments: [] },
    { name: 'IsNotEmptyObject', arguments: [] },
  ]);

  tree.overwrite(typesFile, formatTsFile(typesFileContent));
}

function updateConfigFiles(project: string | undefined, tree: Tree): void {
  const configDir: Path = join((project || '.') as Path, 'src/config');

  tree.getDir(configDir).subfiles.forEach(file => {
    tree.overwrite(
      join(configDir, file),
      formatTsFile(
        addEntryToObjctLiteralVariable(
          tree.read(join(configDir, file))!.toString('utf-8'),
          'def',
          'jwtConfig',
          JSON.stringify(defaultJwtConfig),
        ),
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
    ]);
  };
}
