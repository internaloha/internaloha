import { Command } from 'commander';
import { TestScraper } from './scrapers/Scraper.test';

// Process the command line arguments.
const program = new Command()
  .option('--scraper <scraper>', 'Run a specific scraper.', 'all')
  .option('--log-level <level>', 'One of: trace, debug, info, warn, error.', 'warn')
  .parse(process.argv);
const options = program.opts();
console.log(options);

// Now indicate that processing is starting.
console.log(`Starting up scraper: ${options['scraper']}. Log level: ${options['logLevel']}`);

const testScraper = new TestScraper({ logLevel: options['logLevel'] });

testScraper.scrape();
