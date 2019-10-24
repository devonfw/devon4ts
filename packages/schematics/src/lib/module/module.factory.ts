import { externalSchematic, Rule } from '@angular-devkit/schematics';
import { ModuleOptions } from '@nestjs/schematics/lib/module/module.schema';

export function main(options: ModuleOptions): Rule {
  const newOptions = { ...options };
  newOptions.name = options.name.startsWith('app/') ? options.name : 'app/' + options.name;
  newOptions.language = 'ts';

  return externalSchematic('@nestjs/schematics', 'module', newOptions);
}
