import * as yargs from 'yargs';
import { SchemaSyncCommand } from 'typeorm/commands/SchemaSyncCommand';
import { SchemaDropCommand } from 'typeorm/commands/SchemaDropCommand';
import { QueryCommand } from 'typeorm/commands/QueryCommand';
import { EntityCreateCommand } from 'typeorm/commands/EntityCreateCommand';
import { MigrationCreateCommand } from 'typeorm/commands/MigrationCreateCommand';
import { MigrationRunCommand } from 'typeorm/commands/MigrationRunCommand';
import { MigrationRevertCommand } from 'typeorm/commands/MigrationRevertCommand';
import { MigrationShowCommand } from 'typeorm/commands/MigrationShowCommand';
import { SubscriberCreateCommand } from 'typeorm/commands/SubscriberCreateCommand';
import { SchemaLogCommand } from 'typeorm/commands/SchemaLogCommand';
import { MigrationGenerateCommand } from 'typeorm/commands/MigrationGenerateCommand';
import { VersionCommand } from 'typeorm/commands/VersionCommand';
import { CacheClearCommand } from 'typeorm/commands/CacheClearCommand';

export const command = 'db';
export const describe = 'Execute a database command.';

export function handler(args: yargs.Arguments): void {
  // eslint-disable-next-line no-console
  console.log(args);
}

export function builder(args: yargs.Argv): yargs.Argv {
  return args
    .command(new SchemaSyncCommand())
    .command(new SchemaLogCommand())
    .command(new SchemaDropCommand())
    .command(new QueryCommand())
    .command(new EntityCreateCommand())
    .command(new SubscriberCreateCommand())
    .command(new MigrationCreateCommand())
    .command(new MigrationGenerateCommand())
    .command(new MigrationRunCommand())
    .command(new MigrationShowCommand())
    .command(new MigrationRevertCommand())
    .command(new VersionCommand())
    .command(new CacheClearCommand())
    .recommendCommands()
    .demandCommand();
}
