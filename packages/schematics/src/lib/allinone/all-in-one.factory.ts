import { chain, Rule, schematic } from '@angular-devkit/schematics';
import { DEFAULT_PATH } from './defaults';
import { readFileSync } from 'fs';

interface IAllInOne {
  path: string;
}

export function allInOne(options: IAllInOne): Rule {
  const schematics = JSON.parse(readFileSync(options.path || DEFAULT_PATH).toString('utf-8'));

  const rules = schematics.map((e: any) => {
    return schematic(e.name, e.options);
  });

  return chain(rules);
}
