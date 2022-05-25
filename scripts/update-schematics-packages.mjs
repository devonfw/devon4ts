#!/usr/bin/env zx

import { IndentationText, Project, QuoteKind } from 'ts-morph';
import { fs } from 'zx';
import 'zx/globals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

const endpoint = 'https://registry.npmjs.org/';
const packageJson = JSON.parse(await fs.readFile(path.join(__dirname, '../package.json')));

function getVersionFromPackageJson(name) {
  return packageJson.dependencies[name] || packageJson.devDependencies[name];
}

async function getVersionFromNpmRegistry(name) {
  let resp = await fetch(endpoint + encodeURI(name));
  if (!resp.ok) {
    return undefined;
  }
  return '^' + (await resp.json())['dist-tags'].latest;
}

async function getLatestPackageVersion(name) {
  return getVersionFromPackageJson(name) || (await getVersionFromNpmRegistry(name));
}

// console.log(await getLatestPackageVersion('pg'));

const tsProject = new Project({
  manipulationSettings: {
    indentationText: IndentationText.TwoSpaces,
    quoteKind: QuoteKind.Single,
  },
  // useInMemoryFileSystem: true,
  skipLoadingLibFiles: true,
});

const file = tsProject.addSourceFileAtPath(path.join(__dirname, '../packages/schematics/src/lib/packagesVersion.ts'));

const packagesVersion = file.getVariableStatement('packagesVersion').getDeclarations()[0].getInitializer();

for (const e of packagesVersion.getProperties()) {
  const init = e.getInitializer();

  const newValue = `'${await getLatestPackageVersion(
    init.getProperty('packageName').getStructure().initializer.replaceAll("'", ''),
  )}'`;
  init.getProperty('packageVersion').set({
    initializer: newValue,
  });

  console.log(e.getStructure());
}

await tsProject.save();
