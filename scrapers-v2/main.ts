import * as fs from 'fs';
import { Command, Option } from 'commander';
import { NsfReuScraper } from './scrapers/Scraper.nsf-reu';
import { TestScraper } from './scrapers/Scraper.test';
import { TestScraper2 } from './scrapers/Scraper2.test';

/**
 *  Create all possible scraper instances here. Keys must be all lower case.
 *  When adding a new scraper to the system, you should only need to import it above
 *  and add it to the scrapers object below.
 */
const scrapers = {
  testscraper: new TestScraper(),
  testscraper2: new TestScraper2(),
  'nsf-reu': new NsfReuScraper(),
};

/**
 * ts-node does not allow top-level await.  This makes it hard to sequentialize execution of scrapers
 * within this script if I try to invoke more than one. We have experienced issues with parallelized scraper
 * execution in the past (perhaps a problem with puppeteer).
 * Therefore, for now, this script is set up to allow running of only a single scraper
 * at a time.
 * As a workaround, you can create an OS-level script to invoke this script multiple times with different scrapers.
 * This will bring up a new JS process each time, which guarantees isolation. This might be preferable
 */

/* Now create an array of scraper names for reference in CLI help. */
const scraperNames = Object.values(scrapers).map(scraper => scraper.name.toLowerCase());

// Process the command line arguments.
const program = new Command()
  .addOption(new Option('-s, --scraper <scraper>', 'Specify the scraper.')
    .choices(scraperNames)
    .makeOptionMandatory(true))
  .addOption(new Option('-l, --log-level <level>', 'Specify logging level')
    .default('warn')
    .choices(['trace', 'debug', 'info', 'warn', 'error']))
  .addOption(new Option('-c, --config-file <config-file>', 'Specify config file name.')
    .default('config.json'))
  .option('-nh, --no-headless', 'Disable headless operation (display browser window during execution)')
  .option('-dt, --devtools', 'Open a devtools window during run.')
  .option('-sm, --slowMo', 'Pause each puppeteer action by the provided number of milliseconds.', '0')
  .parse(process.argv);
const options = program.opts();
// console.log(options);

const configFile = options['configFile'];
let config;
try {
  config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
} catch (Exception) {
  console.log(`${configFile} missing or unable to be parsed. Exiting without running scrapers.`);
  process.exit(0);
}

/* Set the run options for all scrapers, even though we will (currently) only run one of them. */
Object.values(scrapers).forEach(scraper => {
  scraper.config = config;
  scraper.log.setLevel(options['logLevel']);
  scraper.headless = options['headless'];
  scraper.slowMo = parseInt(options['slowMo'], 10);
});

/* Run the chosen scraper. */
scrapers[options['scraper'].toLowerCase()].scrape();
