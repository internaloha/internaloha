import { Command } from 'commander';
import { TestScraper } from './scrapers/Scraper.test';
import { TestScraper2 } from './scrapers/Scraper2.test';

// Process the command line arguments.
const program = new Command()
  .option('--scraper <scraper>', 'Run a specific scraper.', 'all')
  .option('--log-level <level>', 'One of: trace, debug, info, warn, error.', 'warn')
  .parse(process.argv);
const options = program.opts();
// console.log(options);

const logLevel = options['logLevel'];

const scrapers = {
  TESTSCRAPER: new TestScraper({ logLevel }),
  TESTSCRAPER2: new TestScraper2({ logLevel }),
};

if (options['scraper'] === 'all') {
  Object.values(scrapers).forEach(scraper => scraper.scrape());
} else {
  scrapers[options['scraper'].toUpperCase()].scrape();
}
