import log from 'loglevel';
import chalk from 'chalk';

// For some reason, loglevel-plugin-prefix needs 'require' rather than 'import'.
const prefix = require('loglevel-plugin-prefix');

const colors = {
  TRACE: chalk.magenta,
  DEBUG: chalk.cyan,
  INFO: chalk.blue,
  WARN: chalk.yellow,
  ERROR: chalk.red,
};

// Logging messages are prefixed with the timestamp, the scraper name, and the log level.
prefix.reg(log);
prefix.apply(log, {
  format(level, logname, timestamp) {
    return `${chalk.gray(`[${timestamp}]`)} ${colors[level.toUpperCase()](level)} ${colors[level.toUpperCase()](logname)}`;
  },
});

export class Scraper {
  public name: string;
  protected url: string;
  protected credentials: Record<string, string>;
  protected minimumListings: number;
  protected statisticsFilePath: string;
  protected listingFilePath: string;
  public log: any;

  /** Initialize the scraper state and provide configuration info. */
  constructor({ name, url, credentials = {}, minimumListings = 0, listingFilePath = './listings', statisticsFilePath = './statistics', logLevel = 'warn' }) {
    this.name = name;
    this.url = url;
    this.credentials = credentials;
    this.minimumListings = minimumListings;
    this.listingFilePath = listingFilePath;
    this.statisticsFilePath = statisticsFilePath;
    this.log = log.getLogger(this.name);
    this.log.setLevel(logLevel);
    this.log.info(`Creating scraper: ${this.name}`);
  }

  /**
   * Go to the site and perform any login necessary.
   * @throws Error if login fails or site cannot be found.
   */
  login() {
    this.log.info('Starting login');
  }

  /**
   * Search for internship listings.
   * This can yield either a set of URLs to pages with listings, or a single page with all the listings.
   * @throws Error if the search generates an error, or if it does not yield minimumListings.
   */
  search() {
    this.log.info('Starting search');

  }

  /**
   * Sets an internal cursor to point to the next listing to be parsed.
   * @return false if there are no more listings to parse.
   * @throws Error if a problem occurred getting the next listing.
   */
  nextListing() {
    this.log.info('Starting next listing');

  }

  /**
   * Parses the current listing.
   * Adds the parsed listing to an internal object.
   * @throws Error if a problem occurred parsing this listing.
   */
  parseListing() {
    this.log.info('Starting parse listing');
  }

  /**
   * Writes the listings to the outputFilePath.
   * @throws Error if a problem occurred writing the listings.
   */
  writeListings() {
    this.log.info('Starting write listings');
  }

  /**
   * Appends a line to the statisticsFilePath with statistics about this run.
   * The statistics file is in CSV format.
   * Statistics include:
   *   * Name of scraper
   *   * Date and time of the run.
   *   * Elapsed time for this run.
   *   * Total number of listings found.
   *   * Any errors thrown (including short description)
   */
  writeStatistics() {
    this.log.info('Starting write statistics');
  }

  scrape() {
    this.login();
    this.search();
    this.nextListing();
    this.parseListing();
    this.writeListings();
    this.writeStatistics();
  }
}
