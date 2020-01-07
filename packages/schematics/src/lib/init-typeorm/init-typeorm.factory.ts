import { join, Path } from '@angular-devkit/core';
import { apply, chain, mergeWith, move, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics/dist/utils/module.finder';
import {
  addEntryToObjctLiteralVariable,
  addGetterToClass,
  addImports,
  addPropToInterface,
  addToModuleDecorator,
} from '../../utils/ast-utils';
import { mergeFiles } from '../../utils/merge';
import { existsConfigModule, formatTsFiles, formatTsFile } from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';

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
            packagesVersion,
          }),
          formatTsFiles(),
          move(options.path as Path),
          mergeFiles(tree),
        ]),
      ),
      addTypeormToCoreModule(options.path),
      addDatabaseConfiguration(options.path),
    ]);
  };
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
      tree.overwrite(module, formatTsFile(fileContent));
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

  tree.overwrite(configServicePath, formatTsFile(configServiceContent));
}

function updateConfigTypeFile(project: string | undefined, tree: Tree) {
  const typesFile: Path = join((project || '.') as Path, 'src/app/core/configuration/model/types.ts');

  let typesFileContent = tree.read(typesFile)!.toString('utf-8');
  typesFileContent = addImports(typesFileContent, 'ConnectionOptions', 'typeorm');
  typesFileContent = addPropToInterface(typesFileContent, 'IConfig', 'database', 'ConnectionOptions');

  tree.overwrite(typesFile, formatTsFile(typesFileContent));
}

function updateConfigFiles(project: string | undefined, tree: Tree) {
  const configDir: Path = join((project || '.') as Path, 'src/config');
  const ormconfigContent = tree.read(join((project || '.') as Path, 'ormconfig.json'))!.toString('utf-8');

  tree.getDir(configDir).subfiles.forEach(file => {
    tree.overwrite(
      join(configDir, file),
      formatTsFile(
        addEntryToObjctLiteralVariable(
          tree.read(join(configDir, file))!.toString('utf-8'),
          'def',
          'database',
          file === 'default.ts' ? 'require("../../ormconfig.json")' : ormconfigContent,
        ),
      ),
    );
  });
}
