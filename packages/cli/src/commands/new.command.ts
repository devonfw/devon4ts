/* eslint-disable no-console */
import { strings } from '@angular-devkit/core';
import { Input } from '@nestjs/cli/commands';
import * as chalk from 'chalk';
import { readFileSync, writeFileSync } from 'fs';
import * as inquirer from 'inquirer';
import * as path from 'path';
import * as tmp from 'tmp-promise';
import * as yargs from 'yargs';
import { executeCollection, initGit, installPackages, mapSchematicOptions } from '../utils/utils';
import Separator = require('inquirer/lib/objects/separator');

interface ICollectionToRun {
  name: string;
  options: any;
}

export const command = 'new [name]';
export const describe = 'Create a new devon4node application, based on NestJS.';
export const aliases = ['n'];

/**
 * As we based this CLI on NestJS CLI, we print their open collective.
 */
function printCollective(): void {
  console.log('\n\n' + chalk.yellow('devon4node is based on Nest.'));
  console.log('Please consider donating to their open collective');
  console.log('to help them maintain the framework.\n\n');
  console.log(`${chalk.bold(`Donate:`)} ${chalk.underline('https://opencollective.com/nest')}`);
  console.log('\n');
}

/**
 * Execute a schematic to generate the application files.
 *
 * @param collectionName schematic collection to execute
 * @param options schematic options
 */
async function generateApplicationFiles(collectionName: string, options: Input[]): Promise<void> {
  const schematicOptions: string[] = mapSchematicOptions(collectionName, options);

  await executeCollection(schematicOptions);
}

/**
 * Ask for general modules.
 *
 * @param whenName ask for name?
 */
async function askGeneralModules(basePath: string /*_dryRun: boolean */): Promise<any> {
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'schematics',
      message: 'Modules to add:',
      choices: [
        {
          name: 'Configuration module',
          short: 'config',
          value: {
            name: 'config-module',
            options: { path: basePath },
          },
        },
        {
          name: 'Database ORM (TypeOrm)',
          short: 'typeorm',
          value: {
            name: 'typeorm',
            options: { path: basePath },
          },
        },
        {
          name: 'Security (cors + HTTP security headers)',
          short: 'security',
          value: {
            name: 'security',
            options: { path: basePath },
          },
        },
        {
          name: 'Add @devon4node/mailer module?',
          short: 'mailer',
          value: {
            name: 'mailer',
            options: { path: basePath },
          },
        },
        {
          name: 'Add swagger module?',
          short: 'swagger',
          value: {
            name: 'swagger',
            options: { path: basePath },
          },
        },
        new Separator('Authentication:'),
        {
          name: 'Auth JWT',
          short: 'JWT',
          value: {
            name: 'auth-jwt',
            options: { path: basePath },
          },
        },
      ],
    },
    {
      type: 'list',
      name: 'db',
      message: 'Database engine?',
      choices: ['postgres', 'cockroachdb', 'mariadb', 'mysql', 'sqlite', 'oracle', 'mssql', 'mongodb'],
      when: (answ): boolean => {
        return (answ.schematics as ICollectionToRun[]).filter(elem => elem.name === 'typeorm').length > 0;
      },
    },
  ]);

  return answers.schematics.map((element: ICollectionToRun) => {
    if (element.name === 'typeorm') {
      element.options.db = answers.db;
    }

    return element;
  });
}

/**
 * Ask for specific application modules.
 *
 * @param useTypeorm use typeorm?
 * @param basePath application base path
 * @param dryRun dry run execution?
 */
async function askSpecificModules(useTypeorm: boolean, basePath: string): Promise<ICollectionToRun[]> {
  const newAllInOne: ICollectionToRun[] = [];
  const moreModules = await inquirer.prompt({
    name: 'continue',
    type: 'confirm',
    message: 'Do you want to add an application module?',
  });
  let repeat = moreModules.continue;
  let extraChoices: any = [
    { name: 'Service', value: 'service', short: 'service' },
    { name: 'Controller', value: 'controller', short: 'controller' },
  ];
  if (useTypeorm) {
    extraChoices = [
      {
        name: 'Crud controller (also adds crud service and entity)',
        value: 'crud',
        short: 'crud',
      },
      new Separator(),
      ...extraChoices,
      {
        name: 'Entity',
        value: 'entity',
        short: 'entity',
      },
    ];
  }

  while (repeat) {
    const modules = await inquirer.prompt([
      {
        name: 'module',
        type: 'input',
        message: 'Module name',
      },
      {
        name: 'extras',
        type: 'checkbox',
        message: 'Add aditional components to module',
        choices: extraChoices,
      },
      {
        name: 'crud',
        message: 'Crud controllers (Separated by commas)',
        when: (ans): boolean => ans.extras.includes('crud'),
      },
      {
        name: 'controller',
        message: 'Controllers (Separated by commas)',
        when: (ans): boolean => ans.extras.includes('controller'),
      },
      {
        name: 'service',
        message: 'Services (Separated by commas)',
        when: (ans): boolean => ans.extras.includes('service'),
      },
      {
        name: 'entity',
        message: (ans): string =>
          'Entities names (Separated by commas)' + (ans && ans.crud ? ' - Already created by crud: ' + ans.crud : ''),
        when: (ans): boolean => ans.extras.includes('entity'),
      },
    ]);

    if (!modules || modules.module === '') {
      continue;
    }

    newAllInOne.push({
      name: 'module',
      options: {
        name: modules.module,
        path: basePath === '.' ? undefined : path.posix.join(basePath, 'src'),
      },
    });

    if (modules.crud) {
      modules.crud.split(',').forEach((element: string) => {
        newAllInOne.push({
          name: 'crud',
          options: {
            name: modules.module + path.posix.sep + element.trim(),
            path: basePath,
          },
        });
      });
    }

    if (modules.controller) {
      modules.controller.split(',').forEach((element: string) => {
        newAllInOne.push({
          name: 'controller',
          options: {
            name: modules.module + path.posix.sep + element.trim(),
            path: basePath,
          },
        });
      });
    }

    if (modules.service) {
      modules.service.split(',').forEach((element: string) => {
        newAllInOne.push({
          name: 'service',
          options: {
            name: modules.module + path.posix.sep + element.trim(),
            path: basePath,
          },
        });
      });
    }

    if (modules && modules.entity) {
      modules.entity.split(',').forEach((element: string) => {
        newAllInOne.push({
          name: 'entity',
          options: {
            name: modules.module + path.posix.sep + element.trim(),
            path: basePath,
          },
        });
      });
    }

    repeat = (
      await inquirer.prompt({
        name: 'continue',
        type: 'confirm',
        message: 'Do you want to add more modules?',
      })
    ).continue;
  }

  return newAllInOne;
}

/**
 * Build the New command.
 *
 * @param args yargs.Argv
 */
export function builder(args: yargs.Argv): yargs.Argv {
  return args
    .positional('name', {
      describe: 'Application name',
      type: 'string',
    })
    .option('no-interactive', {
      describe: 'Execute the command without ask anything to the user',
      type: 'boolean',
      alias: 'n',
      default: false,
    })
    .option('dry-run', {
      alias: 'd',
      describe: 'Allow to test changes before execute command.',
      type: 'boolean',
    })
    .option('skip-git', {
      alias: 'g',
      describe: 'Allow to skip git repository initialization.',
      type: 'boolean',
    })
    .option('skip-install', {
      alias: 's',
      describe: 'Allow to skip package installation.',
      type: 'boolean',
    })
    .option('typeorm', {
      alias: 't',
      describe: 'Allow to select the type of database.',
      type: 'string',
    })
    .option('config-module', {
      alias: 'c',
      describe: 'Allow to add config module or not.',
      type: 'boolean',
    })
    .option('swagger', {
      alias: 'a',
      describe: 'Allow to add swagger module or not.',
      type: 'boolean',
    })
    .option('security', {
      alias: 'y',
      describe: 'Allow to add security (cors + HTTP security headers) or not.',
      type: 'boolean',
    })
    .option('mailer', {
      alias: 'm',
      describe: 'Allow to add mailer module or not.',
      type: 'boolean',
    })
    .option('auth-jwt', {
      alias: 'j',
      describe: 'Allow to add Auth JWT module or not.',
      type: 'boolean',
    });
}

export async function generateCodeInteractive(newApp: boolean, args: yargs.Arguments): Promise<void> {
  const options: Input[] = [];
  const inputs: Input[] = [];
  let name: string;
  let basePath: string;

  if (newApp) {
    if (args.name) {
      name = args.name as string;
      basePath = args.name as string;
    } else {
      name = strings.dasherize(
        (
          await inquirer.prompt([
            {
              type: 'input',
              name: 'name',
              message: 'Introduce the application name',
            },
          ])
        ).name,
      );
      basePath = name;
    }
  } else {
    basePath = (args.path as string) || '.';
    name = JSON.parse(readFileSync(path.posix.join(basePath as string, 'package.json')).toString()).name;
  }

  if (!name) {
    console.error('Application name is required.');
    process.exit(1);
  }

  const generalModules = await askGeneralModules(basePath /*, !!args.d*/);
  const allInOne: ICollectionToRun[] = [];

  // change to if create application
  if (newApp) {
    allInOne.push({
      name: 'application',
      options: {
        name,
        'dry-run': !!args.d,
        'language': 'ts',
      },
    });
  }

  allInOne.push(...generalModules);

  let useTypeorm: boolean = allInOne.reduce((previous: boolean, current: ICollectionToRun) => {
    if (current.name === 'typeorm') {
      return true;
    }
    return previous;
  }, false);
  if (!useTypeorm) {
    try {
      const fileContent: string = readFileSync('package.json').toString();
      useTypeorm = fileContent.includes('"typeorm"');
    } catch (e) {
      // nothing to do
    }
  }

  allInOne.push(...(await askSpecificModules(useTypeorm, basePath)));

  const file = await tmp.file();
  writeFileSync(file.path, JSON.stringify(allInOne));

  inputs.push({ name: 'path', value: '"' + file.path + '"' });
  if (args.d) {
    inputs.push({ name: 'dry-run', value: !!args.d });
  }

  await generateApplicationFiles('@devon4node/schematics:all-in-one', inputs.concat(options));

  if (!args.d) {
    if (newApp && !args.g) {
      await initGit(basePath);
    }
    if (!args.s) {
      await installPackages(basePath);
    }
  }

  printCollective();
}

export async function generateCode(args: yargs.Arguments<any>): Promise<void> {
  const inputs: Input[] = [];
  const name: string = args.name;

  if (!name) {
    console.error('Application name is required.');
    process.exit(1);
  }

  const allInOne: ICollectionToRun[] = [];

  allInOne.push({
    name: 'application',
    options: {
      name,
      language: 'ts',
    },
  });

  if (args.c) {
    allInOne.push({
      name: 'config-module',
      options: {
        path: name,
      },
    });
  }

  if (args.t) {
    allInOne.push({
      name: 'typeorm',
      options: {
        path: name,
        db: args.t,
      },
    });
  }

  if (args.y) {
    allInOne.push({
      name: 'security',
      options: {
        path: name,
      },
    });
  }

  if (args.m) {
    allInOne.push({
      name: 'mailer',
      options: {
        path: name,
      },
    });
  }

  if (args.a) {
    allInOne.push({
      name: 'swagger',
      options: {
        path: name,
      },
    });
  }

  if (args.j) {
    allInOne.push({
      name: 'auth-jwt',
      options: {
        path: name,
      },
    });
  }

  const file = await tmp.file();
  writeFileSync(file.path, JSON.stringify(allInOne));

  inputs.push({ name: 'path', value: '"' + file.path + '"' });
  if (args.d) {
    inputs.push({ name: 'dry-run', value: !!args.d });
  }

  await generateApplicationFiles('@devon4node/schematics:all-in-one', inputs);

  if (!args.d) {
    if (!args.g) {
      await initGit(name);
    }
    if (!args.s) {
      await installPackages(name);
    }
  }

  printCollective();
}

/**
 * New command handler.
 *
 * @param args program arguments
 */
export async function handler(args: yargs.Arguments): Promise<void> {
  args.name = strings.dasherize(args.name as string);

  if (args.n) {
    await generateCode(args);
  } else {
    await generateCodeInteractive(true, args);
  }
}
