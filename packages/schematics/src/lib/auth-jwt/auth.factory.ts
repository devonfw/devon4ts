import { join, Path, strings } from '@angular-devkit/core';
import { apply, chain, mergeWith, move, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics/utils/module.finder';
import { addToModuleDecorator, addImports, addGetterToClass } from '../../utils/ast-utils';
import { packagesVersion } from '../packagesVersion';
import { noop } from 'rxjs';
import { existsConfigModule } from '../../utils/tree-utils';
import { addPropToInterface, addEntryToObjctLiteralVariable } from '../../utils/ast-utils';

const defaultJwtConfig = {
  secret: 'SECRET',
  signOptions: { expiresIn: '24h' },
};

interface IAuthJWTOptions {
  path: string;
}

export function authJWT(options: IAuthJWTOptions): Rule {
  return (tree: Tree): Rule => {
    if (!options.path) {
      options.path = '.';
    }
    const config: boolean = existsConfigModule(tree, options.path);
    return chain([
      mergeWith(
        apply(url('./files'), [
          template({
            ...strings,
            ...options,
            config,
          }),
          move(join((options.path || '.') as Path)),
        ]),
      ),
      updatePackageJson(options.path),
      addAuthToCoreModule(options.path),
      config ? addJWTConfiguration(options.path) : noop,
    ]);
  };
}

function updatePackageJson(path: string): Rule {
  return (host: Tree): Tree => {
    const packageJsonPath = join(path as Path, 'package.json');
    const content = JSON.parse(host.read(packageJsonPath)!.toString('utf-8'));
    content.dependencies['@nestjs/passport'] = packagesVersion.nestjsPassport;
    content.dependencies.bcrypt = packagesVersion.bcrypt;
    content.dependencies.passport = packagesVersion.passport;
    content.dependencies['@nestjs/jwt'] = packagesVersion.nestjsJwt;
    content.dependencies['passport-jwt'] = packagesVersion.passportJwt;
    content.devDependencies['@types/passport-jwt'] = packagesVersion.typesPassportJwt;
    content.devDependencies['@types/bcrypt'] = packagesVersion.typesBcrypt;
    content.dependencies.lodash = packagesVersion.lodash;
    content.devDependencies['@types/lodash'] = packagesVersion.typesLodash;

    host.overwrite(packageJsonPath, JSON.stringify(content, null, 2));
    return host;
  };
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

    const fileContent = addToModuleDecorator(
      tree.read(module)!.toString('utf-8'),
      'CoreModule',
      './auth/auth.module',
      'AuthModule',
      'imports',
      true,
    );

    if (fileContent) {
      tree.overwrite(module, fileContent);
    }

    return tree;
  };
}

function addJWTConfiguration(project: string | undefined): Rule {
  return (tree: Tree): Tree => {
    updateConfigTypeFile(project, tree);
    updateConfigFiles(project, tree);
    updateConfigurationService(project, tree);

    return tree;
  };
}

function updateConfigurationService(project: string | undefined, tree: Tree) {
  const configServicePath = join(
    '.' as Path,
    project || '.',
    'src/app/core/configuration/services/configuration.service.ts',
  );

  let configServiceContent = tree.read(configServicePath)!.toString();
  configServiceContent = addImports(configServiceContent, 'JwtModuleOptions', '@nestjs/jwt');
  configServiceContent = addGetterToClass(
    configServiceContent,
    'ConfigurationService',
    'jwtConfig',
    'JwtModuleOptions',
    'return { ...this.get("jwtConfig")! } as JwtModuleOptions;',
  );

  tree.overwrite(configServicePath, configServiceContent);
}

function updateConfigTypeFile(project: string | undefined, tree: Tree) {
  const typesFile: Path = join((project || '.') as Path, 'src/app/core/configuration/model/types.ts');

  let typesFileContent = tree.read(typesFile)!.toString('utf-8');
  typesFileContent = addImports(typesFileContent, 'JwtModuleOptions', '@nestjs/jwt');
  typesFileContent = addPropToInterface(typesFileContent, 'IConfig', 'jwtConfig', 'JwtModuleOptions');

  tree.overwrite(typesFile, typesFileContent);
}

function updateConfigFiles(project: string | undefined, tree: Tree) {
  const configDir: Path = join((project || '.') as Path, 'src/config');

  tree.getDir(configDir).subfiles.forEach(file => {
    tree.overwrite(
      join(configDir, file),
      addEntryToObjctLiteralVariable(
        tree.read(join(configDir, file))!.toString('utf-8'),
        'def',
        'jwtConfig',
        JSON.stringify(defaultJwtConfig),
      ),
    );
  });
}
