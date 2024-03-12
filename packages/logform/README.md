# devon4ts

[devonfw](https://www.devonfw.com/) is a platform which provides solutions to building business applications which combine best-in-class frameworks and libraries as well as industry proven practices and code conventions. devonfw is 100% Open Source (Apache License version 2.0) since the beginning of 2018.

devon4ts is the NodeJS stack of devonfw. It allows you to build business applications (backends) using NodeJS technology in standardized way based on established best-practices.

![License](https://img.shields.io/npm/l/@devon4ts/logform)
![License](https://img.shields.io/npm/v/@devon4ts/logform)
![License](https://img.shields.io/librariesio/release/npm/@devon4ts/logform)
![License](https://img.shields.io/npm/dt/@devon4ts/logform)

## devon4ts logform

A set of formats for logform

### Formats

#### colorize

The `colorize` format adds a set of predefined colours to log messages.

Options:

- **enabled**: flag to enable/disable this feature. Optional.

```typecript
import { colorize } from '@devon4ts/logform';

const colorizeFormat = colorize();

const info = colorizeFormat.transform({
  level: 'info',
  message: 'message',
  context: 'MyApp',
});

// {
//   level: '\x1B[32minfo\x1B[39m',
//   message: 'message',
//   context: '\x1B[33mMyApp\x1B[39m'
// }
```

#### logfmt

The `logfmt` prints the log using the logfmt pattern.

```typecript
import { logfmt } from '@devon4ts/logform';

const logfmtFormat = logfmt();

const info = logfmtFormat.transform({
  level: 'info',
  message: 'message',
});

// level=info message=message context=main
```

#### separator

The `separator` prints the log using the separator pattern.

```typecript
import { separator } from '@devon4ts/logform';

const separatorFormat = separator();

const info = separatorFormat.transform({
  level: 'info',
  message: 'message',
});

// info | 2022-08-09T21:04:45.764Z | 19493 | main | message
```

#### oneLineStack

The `oneLineStack` removes the new line (if enabled) in stack traces.

Options:

- **enabled**: flag to enable/disable this feature. Optional.

```typecript
import { oneLineStack } from '@devon4ts/logform';

const oneLineStackFormatDisabled = oneLineStack(false);

const info = oneLineStackFormatDisabled.transform({
  level: 'info',
  message: 'error message',
  stack: 'error message \n at main.ts'
});

// {
//   level: 'info',
//   message: 'error message',
//   stack: 'error \n at main.ts'
// }

const oneLineStackFormatEnabled = oneLineStack();

const info = oneLineStackFormatEnabled.transform({
  level: 'info',
  message: 'error message',
  stack: 'error message \n at main.ts'
});

// {
//   level: 'info',
//   message: 'error message',
//   stack: 'error message  \\  at main.ts'
// }
```

## Code of conduct

Visit [code of conduct document](https://github.com/devonfw/.github/blob/master/CODE_OF_CONDUCT.md).

## Contributing guide

Visit [contributing guide document](https://github.com/devonfw/.github/blob/master/CONTRIBUTING.asciidoc).

## Key Principles

Visit [key principles document](https://github.com/devonfw/.github/blob/master/key-principles.asciidoc).
