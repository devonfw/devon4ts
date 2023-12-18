import { basename, dirname, join, normalize, Path } from '@angular-devkit/core';
import { FileEntry, forEach, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { format, Options } from 'prettier';

const PRETTIER_DEFAULT_OPTS: Options = {
  singleQuote: true,
  trailingComma: 'all',
  semi: true,
  printWidth: 120,
  tabWidth: 2,
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  quoteProps: 'consistent',
  useTabs: false,
  parser: 'typescript',
};

export interface BaseNestOptions {
  name: string;
  path?: string;
  flat?: boolean;
  language?: string;
}

export function formatTsFile(content: string): string {
  return format(content, PRETTIER_DEFAULT_OPTS);
}

export function formatTsFiles(): Rule {
  return forEach((fileEntry: FileEntry) => {
    if (
      !fileEntry.path.startsWith('/node_modules') &&
      !fileEntry.path.startsWith('/dist') &&
      fileEntry.path.endsWith('.ts')
    ) {
      return {
        path: fileEntry.path,
        content: Buffer.from(formatTsFile(fileEntry.content.toString())),
      };
    }

    return fileEntry;
  });
}

export function runningAtRootFolder(tree: Tree): boolean {
  return ['/package.json', '/nest-cli.json', '/tsconfig.json'].map(file => tree.exists(file)).every(exists => exists);
}

export function stopExecutionIfNotRunningAtRootFolder(): Rule {
  return tree => {
    if (!runningAtRootFolder(tree)) {
      throw new Error('You must run the schematic at devon4node project root folder.');
    }

    return tree;
  };
}

export function transformOptionsToNestJS<T extends BaseNestOptions>(options: T, folder: string, flat = true): Rule {
  return (host: Tree): Tree => {
    const isRootFolder = runningAtRootFolder(host);

    options.flat = flat;
    options.language = 'ts';

    if (options.name.includes('/')) {
      options.path = dirname(options.name as Path);
      options.name = basename(options.name as Path);
    }

    options.path = normalize(join((options.path as Path) ?? '.', folder));

    if (isRootFolder) {
      options.path = normalize(join('app/' as Path, options.path ?? '.'));
    }

    return host;
  };
}

export function existsConvictConfig(tree: Tree): boolean {
  return tree.exists('src/config.ts');
}

export function installNodePackages(): Rule {
  return (host: Tree, context: SchematicContext): Tree => {
    context.addTask(new NodePackageInstallTask({ packageManager: 'yarn' }));
    return host;
  };
}
