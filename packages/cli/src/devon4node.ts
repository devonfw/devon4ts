import * as yargs from 'yargs';
import * as NewCommand from './commands/new.command';
import * as DbCommand from './commands/db.command';
import * as GenerateCommand from './commands/generate';

/**
 * Main function of the program.
 *
 * @export
 */
export function executable(): any {
  return yargs
    .usage('Usage: $0 <command> [options]')
    .command(NewCommand)
    .command(DbCommand)
    .command(GenerateCommand)
    .demandCommand()
    .wrap(null)
    .strict()
    .alias('v', 'version')
    .help()
    .alias('help', 'h').argv;
}
