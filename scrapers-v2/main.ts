import { Command } from 'commander';
import log from 'loglevel';
import chalk from 'chalk';
import prefix from 'loglevel-plugin-prefix';

// Process the command line arguments.
const program = new Command()
  .option('--scraper <scraper>', 'Run a specific scraper.', 'all')
  .option('--log-level <level>', 'One of: trace, debug, info, warn, error.', 'warn')
  .parse(process.argv);
const options = program.opts();
// console.log(program.opts());

// Set up logging. Start with colors.
const colors = {
  TRACE: chalk.magenta,
  DEBUG: chalk.cyan,
  INFO: chalk.blue,
  WARN: chalk.yellow,
  ERROR: chalk.red,
};

// Automatically add a timestamp and the level to each log message.
prefix.reg(log);
prefix.apply(log, {
  format(level, name, timestamp) {
    return `${chalk.gray(`[${timestamp}]`)} ${colors[level.toUpperCase()](level)}`;
  },
});

// Set the level to whatever was specified in the command invocation.
log.setLevel(options.LogLevel);

// Now indicate that processing is starting.
log.warn(`Running scraper: ${options.Scraper}. Log level: ${options.LogLevel}`);
