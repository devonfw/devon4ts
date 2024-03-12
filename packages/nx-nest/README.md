# devon4ts

[devonfw](https://www.devonfw.com/) is a platform which provides solutions to building business applications which combine best-in-class frameworks and libraries as well as industry proven practices and code conventions. devonfw is 100% Open Source (Apache License version 2.0) since the beginning of 2018.

devon4ts is the NodeJS stack of devonfw. It allows you to build business applications (backends) using NodeJS technology in standardized way based on established best-practices.

![License](https://img.shields.io/npm/l/@devon4ts/nx-nest)
![License](https://img.shields.io/npm/v/@devon4ts/nx-nest)
![License](https://img.shields.io/librariesio/release/npm/@devon4ts/nx-nest)
![License](https://img.shields.io/npm/dt/@devon4ts/nx-nest)

## devon4ts nx-nest

This package contains the devon4ts nx plugin for NestJS. Those plugin contains the generators, executors and tools to work with devon4ts in nx.

## Getting Started

### Generating a new workspace

To create a new devon4ts workspace, run the following command:

**npm**:

```bash
npx create-nx-workspace@latest <workspace-name> --preset=@devon4ts/nx-nest@latest
```

**pnpm**:

```bash
pnpm dlx create-nx-workspace@latest <workspace-name> --preset=@devon4ts/nx-nest@latest
```

### Add to an existing nx project

nx 18+:

```bash
nx add @devon4ts/nx-nest
```

nx < 18:

```bash
pnpm add -D @devon4ts/nx-nest
```

### Generators

- **application**: generate a new NestJS application following the devon4ts structure
- **convict**: adds [convict](https://github.com/mozilla/node-convict) to an application
- **entity**: generate a [TypeORM](https://typeorm.io/entities) entity in an application.
- **mailer**: adds [@devon4ts/mailer](https://www.npmjs.com/package/@devon4ts/mailer) to a project.
- **orm**: adds an ORM configuration to an existing project. Supported ORMs: TypeORM, Prisma, Drizzle.
- **security**: configure CORS and security headers in an existing project.
- **swagger**: adds swagger support to a project.

## Code of conduct

Visit [code of conduct document](https://github.com/devonfw/.github/blob/master/CODE_OF_CONDUCT.md).

## Contributing guide

Visit [contributing guide document](https://github.com/devonfw/.github/blob/master/CONTRIBUTING.asciidoc).

## Key Principles

Visit [key principles document](https://github.com/devonfw/.github/blob/master/key-principles.asciidoc).
