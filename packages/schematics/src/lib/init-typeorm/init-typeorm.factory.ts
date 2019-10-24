import { join, Path } from '@angular-devkit/core';
import {
  apply,
  chain,
  forEach,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics/utils/module.finder';
import { mergeDockerFiles } from '../../utils/merge';
import { addImports, addPropToInterface, addGetterToClass } from '../../utils/ast-utils';
import { addToModuleDecorator, addEntryToObjctLiteralVariable } from '../../utils/ast-utils';
import { packagesVersion } from '../packagesVersion';
import { existsConfigModule } from '../../utils/tree-utils';

export interface ITypeormOptions {
  db: 'postgres' | 'cockroachdb' | 'mariadb' | 'mysql' | 'sqlite' | 'oracle' | 'mssql' | 'mongodb';
  path?: string;
}

export function initTypeorm(options: ITypeormOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    if (!options.path) {
      options.path = '.';
    }
    return chain([
      mergeWith(
        apply(url('./files'), [
          template({
            ...options,
          }),
          move(options.path as Path),
          forEach(mergeDockerFiles(tree)),
        ]),
      ),
      (host: Tree): Tree => {
        host.overwrite(join((options.path || '.') as Path, 'package.json'), updatePackageJson(host, options));
        return host;
      },
      addTypeormToCoreModule(options.path),
      addDatabaseConfiguration(options.path),
    ]);
  };
}

function updatePackageJson(host: Tree, options: ITypeormOptions): string {
  const content = JSON.parse(host.read(join((options.path || '.') as Path, 'package.json'))!.toString('utf-8'));
  content.dependencies['@nestjs/typeorm'] = packagesVersion.nestjsTypeorm;
  content.dependencies.typeorm = packagesVersion.typeorm;
  content.dependencies[packagesVersion.dbpackages[options.db][0]] = packagesVersion.dbpackages[options.db][1];

  return JSON.stringify(content, null, 2);
}

function addTypeormToCoreModule(project: string | undefined): Rule {
  return (tree: Tree): Tree => {
    const module = new ModuleFinder(tree).find({
      name: 'core',
      path: join('.' as Path, project || '.', 'src/app/core/') as Path,
    });
    if (!module) {
      return tree;
    }

    const config = existsConfigModule(tree, project || '.');

    let fileContent: string | undefined = tree.read(module)!.toString('utf-8');

    if (fileContent!.includes('TypeOrmModule.forRoot')) {
      return tree;
    }

    if (!config) {
      fileContent = addToModuleDecorator(
        fileContent,
        'CoreModule',
        '@nestjs/typeorm',
        'TypeOrmModule.forRoot()',
        'imports',
        false,
      );
    } else {
      fileContent = addImports(fileContent, 'ConfigurationService', './configuration/services');
      fileContent = addToModuleDecorator(
        fileContent,
        'CoreModule',
        '@nestjs/typeorm',
        `TypeOrmModule.forRootAsync({
          imports: [ConfigurationModule],
          useFactory: (config: ConfigurationService) => {
            return config.database;
          },
          inject: [ConfigurationService],
        })`,
        'imports',
        false,
      );
    }

    if (fileContent) {
      tree.overwrite(module, fileContent);
    }

    return tree;
  };
}

function addDatabaseConfiguration(project: string | undefined): Rule {
  return (tree: Tree): Tree => {
    const config = existsConfigModule(tree, project || '.');
    if (!config) {
      return tree;
    }

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
  configServiceContent = addImports(configServiceContent, 'ConnectionOptions', 'typeorm');
  configServiceContent = addGetterToClass(
    configServiceContent,
    'ConfigurationService',
    'database',
    'ConnectionOptions',
    'return { ...this.get("database")! } as ConnectionOptions;',
  );

  tree.overwrite(configServicePath, configServiceContent);
}

function updateConfigTypeFile(project: string | undefined, tree: Tree) {
  const typesFile: Path = join((project || '.') as Path, 'src/app/core/configuration/model/types.ts');

  let typesFileContent = tree.read(typesFile)!.toString('utf-8');
  typesFileContent = addImports(typesFileContent, 'ConnectionOptions', 'typeorm');
  typesFileContent = addPropToInterface(typesFileContent, 'IConfig', 'database', 'ConnectionOptions');

  tree.overwrite(typesFile, typesFileContent);
}

function updateConfigFiles(project: string | undefined, tree: Tree) {
  const configDir: Path = join((project || '.') as Path, 'src/config');
  const ormconfigContent = tree.read(join((project || '.') as Path, 'ormconfig.json'))!.toString('utf-8');

  tree.getDir(configDir).subfiles.forEach(file => {
    tree.overwrite(
      join(configDir, file),
      addEntryToObjctLiteralVariable(
        tree.read(join(configDir, file))!.toString('utf-8'),
        'def',
        'database',
        file === 'default.ts' ? 'require("../../ormconfig.json")' : ormconfigContent,
      ),
    );
  });
}
