/* eslint-disable no-console */
import { Input } from '@nestjs/cli/commands';
import { GitRunner } from '@nestjs/cli/lib/runners/git.runner';
import * as chalk from 'chalk';
import { ChildProcess, spawn } from 'child_process';
import { writeFile } from 'fs';
import fetch from 'node-fetch';
import { join, resolve } from 'path';
import { strings } from '@angular-devkit/core';

export function mapSchematicOptions(collectionName: string, options: Input[]): string[] {
  return options.reduce(
    (schematicOptions: string[], option: Input) => {
      if (option.name !== 'skip-install' && option.value !== 'package-manager' && option.value !== 'collection') {
        schematicOptions.push('--' + option.name);
        if (typeof option.value !== 'boolean') {
          schematicOptions.push(option.value);
        }
      }
      return schematicOptions;
    },
    [collectionName],
  );
}

export function executeCollection(schematicOptions: string[]): Promise<null | string> {
  return new Promise<null | string>((res, reject) => {
    const extension = process.platform === 'win32' ? '.cmd' : '';
    const programPath = join(__dirname, '../../node_modules/.bin/', 'schematics' + extension);

    const child: ChildProcess = spawn('"' + programPath + '"', schematicOptions, {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: true,
    });

    child.on('message', message => console.log(message));

    child.on('close', code => {
      if (code === 0) {
        res(null);
      } else {
        console.error(chalk.red('Error executing schematics'));
        reject();
      }
    });
  });
}

export async function installPackages(appName: string): Promise<string | null> {
  return new Promise<null | string>(res => {
    console.log(chalk.blueBright('Installing dependencies... please wait'));
    const child: ChildProcess = spawn('yarn', [], {
      cwd: join(process.cwd(), appName || '.'),
      stdio: 'inherit',
      shell: true,
    });

    child.on('message', message => console.log(message));

    child.on('close', code => {
      if (code === 0) {
        console.error(chalk.green('Dependencies installed successfuly'));
      } else {
        console.error(chalk.red('Error installing dependencies'));
        console.error(chalk.red('Please, try to install it again manually.'));
        console.error(chalk.red('Most of times, this error is caused by a network issue.'));
      }
      res(null);
    });
  });
}

export async function addGitIgnore(folder: string): Promise<void> {
  const url = 'https://www.gitignore.io/api/node,angular,visualstudiocode';
  console.log(chalk.blueBright('Generating .gitignore from: ' + url));
  const path = resolve(folder, '.gitignore');

  const response = await fetch(url);
  const body = await response.text();

  writeFile(path, body, err => {
    if (err) {
      console.error(err);
    }
  });
}

export async function initGit(appPath: string): Promise<void> {
  const path = strings.dasherize(appPath);
  console.log(chalk.blueBright('Initializing git repository... please wait'));
  const runner = new GitRunner();
  await runner.run('init', true, join(process.cwd(), path));
  await addGitIgnore(join(process.cwd(), path));
  console.log(chalk.greenBright('Git initialization ends successfuly'));
}

/**
 * Prettify the code using the format script
 *
 * @param schematicName name of schematics
 * @param argv application arguments
 */
export async function prettifyCode(path?: string): Promise<null | string> {
  return new Promise((res, reject) => {
    console.log(chalk.blueBright('Prettifying the code... please wait'));
    const child: ChildProcess = spawn('npm', ['run', 'format'], {
      cwd: join(process.cwd(), path || '.'),
      stdio: 'inherit',
      shell: true,
    });

    child.on('message', message => console.log(message));

    child.on('close', code => {
      if (code === 0) {
        console.error(chalk.greenBright('Code prettified successfuly'));
        res(null);
      } else {
        console.error(chalk.red('Error prettifying code'));
        reject();
      }
    });
  });
}
