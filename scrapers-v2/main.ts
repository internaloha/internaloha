import { Command, Option } from 'commander';
import { TestScraper } from './scrapers/Scraper.test';
import { TestScraper2 } from './scrapers/Scraper2.test';

/* Create all possible scraper instances here. Keys must be all lower case. */
const scrapers = {
  testscraper: new TestScraper(),
  testscraper2: new TestScraper2(),
};

/* Now create an array of scraper names for reference in CLI help. */
const scraperNames = Object.values(scrapers).map(scraper => scraper.name.toLowerCase());

// Process the command line arguments.
const program = new Command()
  .addOption(new Option('-s, --scraper <scraper>', 'Specify a single scraper, or "all" for all.')
    .default('all')
    .choices(scraperNames.concat('all')))
  .addOption(new Option('-l, --log-level <level>', 'Specify logging level')
    .default('warn')
    .choices(['trace', 'debug', 'info', 'warn', 'error']))
  .parse(process.argv);
const options = program.opts();
// console.log(options);

const logLevel = options['logLevel'];

/* Set the log level for all scrapers. */
Object.values(scrapers).forEach(scraper => scraper.log.setLevel(logLevel));

/* Run the scraper(s). */
if (options['scraper'] === 'all') {
  Object.values(scrapers).forEach(scraper => scraper.scrape());
} else {
  scrapers[options['scraper'].toUpperCase()].scrape();
}
