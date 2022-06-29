import { join, Path } from '@angular-devkit/core';
import { apply, chain, mergeWith, move, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleFinder } from '@nestjs/schematics/dist/utils/module.finder';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { mergeFiles } from '../../utils/merge';
import { existsConfigModule, formatTsFile, formatTsFiles, installNodePackages } from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';

export interface ITypeormOptions {
  db: 'postgres' | 'cockroachdb' | 'mariadb' | 'mysql' | 'sqlite' | 'oracle' | 'mssql' | 'mongodb';
  path?: string;
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

    let fileContent: ASTFileBuilder | undefined = new ASTFileBuilder(tree.read(module)!.toString('utf-8'));

    if (fileContent.build().includes('TypeOrmModule.forRoot')) {
      return tree;
    }

    if (!config) {
      fileContent = fileContent.addToModuleDecorator(
        'CoreModule',
        '@nestjs/typeorm',
        'TypeOrmModule.forRoot()',
        'imports',
        false,
      );
    } else {
      fileContent = fileContent.addImports('ConfigService', '@devon4node/config').addToModuleDecorator(
        'CoreModule',
        '@nestjs/typeorm',
        `TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (config: ConfigService<Config>) => {
            return config.values.database;
          },
          inject: [ConfigService],
        })`,
        'imports',
        false,
      );
    }

    if (fileContent) {
      tree.overwrite(module, formatTsFile(fileContent.build()));
    }

    return tree;
  };
}

function updateConfigTypeFile(project: string | undefined, tree: Tree): void {
  const typesFile: Path = join((project || '.') as Path, 'src/app/shared/model/config/config.model.ts');

  const typesFileContent = new ASTFileBuilder(tree.read(typesFile)!.toString('utf-8'))
    .addImports('ConnectionOptions', 'typeorm')
    .addImports('IsDefined', 'class-validator')
    .addImports('IsNotEmptyObject', 'class-validator')
    .addPropToClass('Config', 'database', 'ConnectionOptions', 'exclamation')
    .addDecoratorToClassProp('Config', 'database', [
      { name: 'IsDefined', arguments: [] },
      { name: 'IsNotEmptyObject', arguments: [] },
    ]);

  tree.overwrite(typesFile, formatTsFile(typesFileContent.build()));
}

function updateConfigFiles(project: string | undefined, tree: Tree): void {
  const configDir: Path = join((project || '.') as Path, 'src/config');
  const ormconfigContent = tree.read(join((project || '.') as Path, 'ormconfig.json'))!.toString('utf-8');

  tree.getDir(configDir).subfiles.forEach(file => {
    tree.overwrite(
      join(configDir, file),
      formatTsFile(
        new ASTFileBuilder(tree.read(join(configDir, file))!.toString('utf-8'))
          .addEntryToObjctLiteralVariable(
            'def',
            'database',
            file === 'default.ts' ? 'require("../../ormconfig.json")' : ormconfigContent,
          )
          .build(),
      ),
    );
  });
}

function addDatabaseConfiguration(project: string | undefined): Rule {
  return (tree: Tree): Tree => {
    const config = existsConfigModule(tree, project || '.');
    if (!config) {
      return tree;
    }

    updateConfigTypeFile(project, tree);
    updateConfigFiles(project, tree);

    return tree;
  };
}

export function initTypeorm(options: ITypeormOptions): Rule {
  return (tree: Tree): Rule => {
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
      installNodePackages(),
    ]);
  };
}
