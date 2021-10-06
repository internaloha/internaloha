import * as fs from 'fs';
import { Command, Option } from 'commander';
import { NsfReuScraper } from './scrapers/Scraper.nsf-reu';
import { TestScraper } from './scrapers/Scraper.test';
import { TestScraper2 } from './scrapers/Scraper2.test';

/* Create all possible scraper instances here. Keys must be all lower case. */
const scrapers = {
  testscraper: new TestScraper(),
  testscraper2: new TestScraper2(),
  'nsf-reu': new NsfReuScraper(),
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
  .addOption(new Option('-c, --config-file <config-file>', 'Specify config file name.')
    .default('config.json'))
  .option('--no-headless', 'Disable headless operation (display browser window during execution)')
  .option('--devtools', 'Open a devtools window during run.')
  .option('--slowMo', 'Pause each puppeteer action by the provided number of milliseconds.', '0')
  .parse(process.argv);
const options = program.opts();
// console.log(options);

const logLevel = options['logLevel'];
const configFile = options['configFile'];
const headless = options['headless'];
const slowMo = options['slowMo'];

let config;
try {
  config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
} catch (Exception) {
  console.log(`${configFile} missing or unable to be parsed. Exiting without running scrapers.`);
  process.exit(0);
}

/* Set the run options for all scrapers. */
Object.values(scrapers).forEach(scraper => {
  scraper.log.setLevel(logLevel);
  scraper.config = config;
  scraper.headless = headless;
  scraper.slowMo = parseInt(slowMo, 10);
});

/* Run the scraper(s). */
const runScraper = async (scraper) => scraper.scrape();
if (options['scraper'] === 'all') {
  Object.values(scrapers).forEach(runScraper);
} else {
  scrapers[options['scraper'].toLowerCase()].scrape();
}
