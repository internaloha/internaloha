import { Command } from 'commander';
import Logger from 'loglevel';

// Process the command line arguments.
const program = new Command()
  .option('-scraper <scraper>', 'Run a specific scraper')
  .parse(process.argv);

const options = program.opts();

Logger.error('Scraper to run is:', options.Scraper);
