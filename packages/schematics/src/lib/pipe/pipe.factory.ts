import { externalSchematic, move, chain } from '@angular-devkit/schematics';
import { join, Path, strings, basename, dirname } from '@angular-devkit/core';

interface IPipeOptions {
  name: string;
  path?: string | Path;
  language?: string;
  sourceRoot?: string;
  spec?: boolean;
  flat?: boolean;
}

export function main(options: IPipeOptions) {
  const newOptions = { ...options };
  newOptions.name = options.name.startsWith('app/') ? options.name : 'app/' + options.name;
  if (newOptions.path) {
    newOptions.path = join(options.path as Path, 'src');
  }
  newOptions.language = 'ts';
  const path = newOptions.path || './src';
  const dir = dirname(newOptions.name as Path);
  const base = strings.dasherize(basename(newOptions.name as Path));

  return chain([
    externalSchematic('@nestjs/schematics', 'pipe', newOptions),
    move(
      strings.dasherize(join(path as Path, dir, base + '.pipe.ts')),
      strings.dasherize(join(path as Path, dir, 'pipes', base + '.pipe.ts')),
    ),
    move(
      strings.dasherize(join(path as Path, dir, base + '.pipe.spec.ts')),
      strings.dasherize(join(path as Path, dir, 'pipes', base + '.pipe.spec.ts')),
    ),
  ]);
}
