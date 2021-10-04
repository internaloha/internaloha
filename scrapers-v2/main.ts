import { Command } from 'commander';
import { createRequire } from 'module';

const TestScraper = createRequire('./scrapers/Scraper.test.ts');

// Process the command line arguments.
const program = new Command()
  .option('--scraper <scraper>', 'Run a specific scraper.', 'all')
  .option('--log-level <level>', 'One of: trace, debug, info, warn, error.', 'warn')
  .parse(process.argv);
const options = program.opts();
// console.log(program.opts());

// Now indicate that processing is starting.
console.log(`Running scraper: ${options.Scraper}. Log level: ${options.LogLevel}`);

const testScraper = TestScraper(options.LogLevel);

testScraper.scrape();
