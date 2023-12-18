import { basename, dirname, join, normalize, Path, strings } from '@angular-devkit/core';
import { dasherize } from '@angular-devkit/core/src/utils/strings';
import {
  apply,
  chain,
  externalSchematic,
  FileEntry,
  forEach,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  Rule,
  schematic,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import * as pluralize from 'pluralize';
import {
  BaseNestOptions,
  formatTsFile,
  formatTsFiles,
  installNodePackages,
  stopExecutionIfNotRunningAtRootFolder,
  transformOptionsToNestJS,
} from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';
import { ASTFileBuilder } from '../../utils/ast-file-builder';

export interface IResourceOptions extends BaseNestOptions {
  name: string;
  spec: boolean;
  type: string;
  crud: boolean;
  orm?: string;
}

function updateDtoImports(content: string, name: string): string {
  const nameSingular = pluralize(name, 1);
  const dtoImports = `./dto/${dasherize('create-' + nameSingular)}.dto`;
  const contentCopy = content;
  let fileType = 'input';

  if (contentCopy.includes(dtoImports)) {
    fileType = 'dto';
  }

  return new ASTFileBuilder(contentCopy)
    .updateImports(
      `./dto/${dasherize('create-' + nameSingular)}.${fileType}`,
      `../model/dtos/${dasherize('create-' + nameSingular)}.${fileType}`,
    )
    .updateImports(
      `./dto/${dasherize('update-' + nameSingular)}.${fileType}`,
      `../model/dtos/${dasherize('update-' + nameSingular)}.${fileType}`,
    )
    .build();
}

function updateControllers(fileEntry: FileEntry, name: string): FileEntry {
  const fileName = basename(fileEntry.path);
  const dirName = dirname(fileEntry.path);

  let content = fileEntry.content.toString();

  content = new ASTFileBuilder(content)
    .updateImports(`./${dasherize(name)}.service`, `../services/${dasherize(name)}.service`)
    .build();

  if (!fileName.endsWith('spec.ts')) {
    content = updateDtoImports(content, name);
  }

  return {
    content: Buffer.from(content),
    path: join(dirName, 'controllers', fileName),
  };
}

function updateResolvers(fileEntry: FileEntry, name: string): FileEntry {
  const fileName = basename(fileEntry.path);
  const dirName = dirname(fileEntry.path);
  const nameSingular = pluralize(name, 1);

  let content = fileEntry.content.toString();

  content = new ASTFileBuilder(content)
    .updateImports(`./${dasherize(name)}.service`, `../services/${dasherize(name)}.service`)
    .updateImports(
      `./entities/${dasherize(nameSingular)}.entity`,
      `../model/entities/${dasherize(nameSingular)}.entity`,
    )
    .build();

  if (!fileName.endsWith('spec.ts')) {
    content = updateDtoImports(content, name);
  }

  return {
    content: Buffer.from(content),
    path: join(dirName, 'controllers', fileName),
  };
}

function updateServices(fileEntry: FileEntry, name: string): FileEntry {
  const fileName = basename(fileEntry.path);
  const dirName = dirname(fileEntry.path);

  let content = fileEntry.content.toString();

  if (!fileName.endsWith('spec.ts')) {
    content = updateDtoImports(content, name);
  }

  return {
    content: Buffer.from(content),
    path: join(dirName, 'services', fileName),
  };
}

function updateGateways(fileEntry: FileEntry, name: string): FileEntry {
  const fileName = basename(fileEntry.path);
  const dirName = dirname(fileEntry.path);

  let content = fileEntry.content.toString();

  content = new ASTFileBuilder(content)
    .updateImports(`./${dasherize(name)}.service`, `../services/${dasherize(name)}.service`)
    .build();

  if (!fileName.endsWith('spec.ts')) {
    content = updateDtoImports(content, name);
  }

  return {
    content: Buffer.from(content),
    path: join(dirName, 'controllers', fileName),
  };
}

function updateModule(fileEntry: FileEntry, name: string): FileEntry {
  const content = new ASTFileBuilder(fileEntry.content.toString())
    .updateImports(`./${dasherize(name)}.service`, `./services/${dasherize(name)}.service`)
    .updateImports(`./${dasherize(name)}.controller`, `./controllers/${dasherize(name)}.controller`)
    .updateImports(`./${dasherize(name)}.resolver`, `./controllers/${dasherize(name)}.resolver`)
    .updateImports(`./${dasherize(name)}.gateway`, `./controllers/${dasherize(name)}.gateway`);

  return {
    content: Buffer.from(formatTsFile(content.build())),
    path: fileEntry.path,
  };
}

function moveToDevon4nodePaths(name: string): Rule {
  return forEach((fileEntry: FileEntry) => {
    if (!fileEntry.path.startsWith('/src/app/' + name) && !fileEntry.path.startsWith('/' + name)) {
      return fileEntry;
    }

    const fileName = basename(fileEntry.path);
    const dirName = dirname(fileEntry.path);

    if (
      (fileName.endsWith('controller.ts') || fileName.endsWith('controller.spec.ts')) &&
      !dirName.endsWith('controllers')
    ) {
      return updateControllers(fileEntry, name);
    }

    if (
      (fileName.endsWith('resolver.ts') || fileName.endsWith('resolver.spec.ts')) &&
      !dirName.endsWith('controllers')
    ) {
      return updateResolvers(fileEntry, name);
    }

    if ((fileName.endsWith('gateway.ts') || fileName.endsWith('gateway.spec.ts')) && !dirName.endsWith('controllers')) {
      return updateGateways(fileEntry, name);
    }

    if ((fileName.endsWith('.service.ts') || fileName.endsWith('.service.spec.ts')) && !dirName.endsWith('services')) {
      return updateServices(fileEntry, name);
    }

    if ((fileName.endsWith('.dto.ts') || fileName.endsWith('.input.ts')) && !dirName.includes('model')) {
      return {
        content: fileEntry.content,
        path: join(dirName, '../model/dtos', fileName),
      };
    }

    if (fileName.endsWith('entity.ts') && !dirName.includes('model')) {
      return {
        content: fileEntry.content,
        path: join(dirName, '../model/entities', fileName),
      };
    }

    if (fileName.endsWith('module.ts')) {
      return updateModule(fileEntry, name);
    }

    return fileEntry;
  });
}

function updatePackageJson(): Rule {
  return (host: Tree): Tree => {
    const filePath = normalize('./package.json');

    if (host.exists(filePath)) {
      const content = JSON.parse(host.read(filePath)!.toString('utf-8'));
      content.dependencies[packagesVersion.nestjsMappedTypes.packageName] =
        packagesVersion.nestjsMappedTypes.packageVersion;

      host.overwrite(filePath, JSON.stringify(content, null, 2));
    }

    return host;
  };
}

function overrideCrud(options: IResourceOptions): Rule {
  if (!options.crud) {
    noop();
  }

  const templateOpts = {
    name: options.name,
    nameSingular: pluralize(options.name, 1),
  };
  return chain([
    options.orm === 'typeorm'
      ? schematic('entity', {
          name: join(options.name as Path, pluralize(options.name, 1)),
          overwrite: true,
        })
      : noop(),
    mergeWith(
      apply(url(`./files/${options.orm}/${options.type}`), [
        template({
          ...strings,
          ...templateOpts,
        }),
        move(join('src/app/' as Path, options.name)),
      ]),
      MergeStrategy.Overwrite,
    ),
  ]);

  // TODO: refactor this to include more ORMs
}

export function main(options: IResourceOptions): Rule {
  return chain([
    stopExecutionIfNotRunningAtRootFolder(),
    transformOptionsToNestJS(options, '.', false),
    externalSchematic('@nestjs/schematics', 'resource', options),
    moveToDevon4nodePaths(options.name),
    overrideCrud(options),
    updatePackageJson(),
    formatTsFiles(),
    installNodePackages(),
  ]);
}
