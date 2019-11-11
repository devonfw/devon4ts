import { InterceptorOptions } from '@nestjs/schematics/lib/interceptor/interceptor.schema';
import { externalSchematic, chain, move } from '@angular-devkit/schematics';
import { join, Path, dirname, strings, basename } from '@angular-devkit/core';

export function main(options: InterceptorOptions) {
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
    externalSchematic('@nestjs/schematics', 'interceptor', newOptions),
    move(
      strings.dasherize(join(path as Path, dir, base + '.interceptor.ts')),
      strings.dasherize(join(path as Path, dir, 'interceptors', base + '.interceptor.ts')),
    ),
    move(
      strings.dasherize(join(path as Path, dir, base + '.interceptor.spec.ts')),
      strings.dasherize(join(path as Path, dir, 'interceptors', base + '.interceptor.spec.ts')),
    ),
  ]);
}
