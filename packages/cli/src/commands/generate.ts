import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import * as yargs from 'yargs';
import { executeCollection, prettifyCode } from '../utils/utils';
import { generateCodeInteractive } from './new.command';

interface ISchematicsFile {
  version: string;
  schematics: ISchematicElement[];
}

interface ISchematicElement {
  name: string;
  description: string;
  options: ISchematicOption[];
}

interface ISchematicOption {
  name: string;
  type: string;
  description: string;
  default?: string;
  required?: boolean;
}

const paramAliases: any = {
  name: 'n',
  path: 'p',
};

export const command = 'generate [schematic]';
export const describe = 'Generate code using a schematic.';
export const aliases = ['g'];

const schematicPath = join(__dirname, '../../node_modules/@devon4node/schematics/');

const SCHEMATICS_FILE = 'schematics.devon4node.json';
const tmpDir = process.env.TEMP || '/var/tmp';

/**
 * Build the Generate command.
 *
 * @param args yargs.Argv
 */
export function builder(args: yargs.Argv) {
  let newYargs = args.strict(false).version(false);

  const options = generateOptionsFile();

  options.schematics.forEach(element => {
    newYargs = newYargs.command(
      element.name,
      element.description,
      generateBuilder(element.name, element.options),
      generateHandler(element.name, element.options),
    );
  });

  return newYargs
    .option('interactive', {
      alias: 'i',
      type: 'boolean',
      description: 'Generate code using the interactive mode (same as new command).',
    })
    .option('skip-install', {
      alias: 's',
      description: 'Allow to skip package installation.',
      type: 'boolean',
      default: false,
    })
    .option('dry-run', {
      alias: 'd',
      type: 'boolean',
      description: 'Allow to test changes before execute command.',
      default: false,
    })
    .option('path', {
      alias: 'p',
      type: 'string',
      description: 'Path to project.',
    });
}

/**
 * Generate command handler.
 *
 * @param args program arguments
 */
export async function handler(args: yargs.Arguments) {
  if (!args.i) {
    yargs.showHelp();
    return;
  }

  generateCodeInteractive(false, args);
}

/**
 * Generate the options file. The options file stores all schematics options.
 * We show this information when we ask for help (--help)
 */
function generateOptionsFile(): ISchematicsFile {
  const packageFile: any = JSON.parse(readFileSync(join(schematicPath, 'package.json')).toString());
  try {
    const schematicsFile: ISchematicsFile = JSON.parse(readFileSync(join(tmpDir, SCHEMATICS_FILE)).toString());

    if (schematicsFile && packageFile && packageFile.version === schematicsFile.version) {
      return schematicsFile;
    }
  } catch (e) {
    // file do not exists, generate a new one
  }

  const schematics: ISchematicsFile = {
    version: packageFile!.version,
    schematics: [],
  };

  const newSchematics: { [key: string]: ISchematicElement } = {};

  const collectionFile = join(schematicPath, packageFile.schematics);
  const collection = JSON.parse(readFileSync(collectionFile).toString());

  if (collection.extends) {
    const packageExtends = JSON.parse(
      readFileSync(join(__dirname, '../../node_modules/', collection.extends, 'package.json')).toString(),
    );

    const schematicsExtendsFile = join(__dirname, '../../node_modules/', collection.extends, packageExtends.schematics);
    const schematicsExtends = JSON.parse(readFileSync(schematicsExtendsFile).toString()).schematics;

    parseSchematics(schematicsExtends, join(dirname(schematicsExtendsFile))).forEach(elem => {
      newSchematics[elem.name] = elem;
    });
  }

  parseSchematics(collection.schematics, dirname(collectionFile)).forEach(e => {
    newSchematics[e.name] = e;
  });

  schematics.schematics = [...Object.values(newSchematics)];

  writeFileSync(join(tmpDir, SCHEMATICS_FILE), JSON.stringify(schematics));
  return schematics;
}

/**
 * Parse the schematics collection to a easy-to-use array.
 *
 * @param schematics The schematics collection file.
 * @param schematicsFolder The folder where the schematics are stored.
 */
function parseSchematics(schematics: any, schematicsFolder: string): ISchematicElement[] {
  const elements: ISchematicElement[] = [];
  Object.keys(schematics).forEach(e => {
    elements.push({
      name: e,
      description: schematics[e].description,
      options: schematics[e].schema ? parseSchematicOptions(join(schematicsFolder, schematics[e].schema)) : [],
    });
  });

  return elements;
}

/**
 * Parses an schematic schema.json to an easy-to-use array.
 * @param schemaPath schematic schema.json path
 */
function parseSchematicOptions(schemaPath: string): ISchematicOption[] {
  const schema = JSON.parse(readFileSync(schemaPath).toString());
  const properties = Object.keys(schema.properties).map(e => {
    return {
      name: e,
      type: schemaTypeToYargsType(schema.properties[e].type),
      description: schema.properties[e].description,
      default: schema.properties[e].default,
      required: schema.required ? (schema.required as string[]).includes(e) : false,
    };
  });

  return properties;
}

/**
 * Parses the schema.json types to yargs types.
 *
 * @param type input type
 */
function schemaTypeToYargsType(type: string) {
  switch (type) {
    case 'array':
    case 'boolean':
    case 'string':
    case 'number':
      return type;
    case 'integer':
      return 'number';
    case 'object':
    case 'null':
    case 'enum':
    default:
      return 'string';
  }
}

/**
 * Generate the schematics command builders.
 *
 * @param schematicName schematic name
 * @param schematicOptions schematic options
 */
function generateBuilder(schematicName: string, schematicOptions: ISchematicOption[]) {
  return (argv: yargs.Argv) => {
    return argv
      .usage(`Usage: $0 devon4node generate ${schematicName} [Options]`)
      .options(generateYargsOptions(schematicOptions))
      .example(`$0 devon4node generate ${schematicName}`, `Generate all files for ${schematicName}`)
      .version(false);
  };
}

/**
 * Generate Yargs options for the schematics commands.
 * @param schematicOptions the schematics options
 */
function generateYargsOptions(schematicOptions: ISchematicOption[]) {
  const result: any = {};

  schematicOptions.forEach(element => {
    const newOption: any = {
      type: element.type,
      description: element.description,
    };

    if (element.default) {
      newOption.default = element.default;
    }

    if (paramAliases[element.name]) {
      newOption.alias = paramAliases[element.name];
    }

    result[element.name] = newOption;
  });

  result['dry-run'] = {
    type: 'boolean',
    description: 'Allow to test changes before execute command.',
    default: false,
    alias: 'd',
  };

  return result;
}

/**
 * Generate a command handler for a schematic
 * @param schematicName schematic name
 * @param schemaOptions schematic options
 */
function generateHandler(schematicName: string, schemaOptions: ISchematicOption[]) {
  return async (argv: yargs.Arguments) => {
    let schematicCollection = '@devon4node/schematics';
    try {
      schematicCollection =
        JSON.parse(readFileSync(join((argv.path as string) || '.', 'nest-cli.json')).toString()).collection ||
        schematicCollection;
    } catch (e) {
      // do nothing
    }
    const args: string[] = [schematicCollection + ':' + schematicName];

    schemaOptions.forEach(element => {
      if (argv[element.name]) {
        args.push('--' + element.name);
        if (element.type !== 'boolean') {
          args.push(argv[element.name] as string);
        }
      }
    });

    await executeCollection(args);

    prettifyCode(argv.path as string);
  };
}
