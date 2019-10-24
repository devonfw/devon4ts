import { join, Path, dirname, basename, strings } from '@angular-devkit/core';
import { chain, externalSchematic, move } from '@angular-devkit/schematics';
import { MiddlewareOptions } from '@nestjs/schematics/lib/middleware/middleware.schema';

export function main(options: MiddlewareOptions) {
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
    externalSchematic('@nestjs/schematics', 'middleware', newOptions),
    move(
      strings.dasherize(join(path as Path, dir, base + '.middleware.ts')),
      strings.dasherize(join(path as Path, dir, 'middlewares', base + '.middleware.ts')),
    ),
    move(
      strings.dasherize(join(path as Path, dir, base + '.middleware.spec.ts')),
      strings.dasherize(join(path as Path, dir, 'middlewares', base + '.middleware.spec.ts')),
    ),
  ]);
}
