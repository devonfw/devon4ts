import { externalSchematic, Rule } from '@angular-devkit/schematics';
import { Path } from '@angular-devkit/core';

export interface IModuleOptions {
  name: string;
  path?: string;
  module?: Path;
  skipImport?: boolean;
  metadata?: string;
  type?: string;
  language?: string;
  sourceRoot?: string;
  flat?: boolean;
}

export function main(options: IModuleOptions): Rule {
  const newOptions = { ...options };
  newOptions.name = options.name.startsWith('app/') ? options.name : 'app/' + options.name;
  newOptions.language = 'ts';

  return externalSchematic('@nestjs/schematics', 'module', newOptions);
}
