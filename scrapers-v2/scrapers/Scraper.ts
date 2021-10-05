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
  public log: any;
  public config: object;
  protected url: string;
  protected credentials: Record<string, string>;
  protected minimumListings: number;
  protected statisticsFilePath: string;
  protected listingFilePath: string;

  /** Initialize the scraper state and provide configuration info. */
  constructor({ name, url, credentials = {}, minimumListings = 0, listingFilePath = './listings', statisticsFilePath = './statistics', logLevel = 'warn' }) {
    this.name = name;
    this.url = url;
    this.config = {};
    this.credentials = credentials;
    this.minimumListings = minimumListings;
    this.listingFilePath = listingFilePath;
    this.statisticsFilePath = statisticsFilePath;
    this.log = log.getLogger(this.name);
    this.log.setLevel(logLevel);
    this.log.trace(`Creating scraper: ${this.name}`);
  }

  /**
   * Go to the site and perform any login necessary.
   * @throws Error if login fails or site cannot be found.
   */
  async login() {
    this.log.trace('Starting login');
  }

  /**
   * Search for internship listings.
   * This should set some kind of internal state to represent all of the relevant listings at this site.
   * @throws Error if the search generates an error, or if it does not yield minimumListings.
   */
  async findListings() {
    this.log.trace('Starting find listings');
  }

  /**
   * True if there is a remaining listing to be processed by processListing.
   */
  moreListings() {
   return false;
  }

  /**
   * Processes the current listing and changes internal state to point to the next listing if available.
   * Processing means extracting the relevant information for writing.
   * @throws Error if a problem occurred parsing this listing.
   */
  async processListing() {
    this.log.trace('Starting process listing');
  }

  /**
   * Writes the listings to a file in listingFilePath.
   * @throws Error if a problem occurred writing the listings.
   */
  async writeListings() {
    this.log.trace('Starting write listings');
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
  async writeStatistics() {
    this.log.trace('Starting write statistics');
  }

  /** Runs the components of this scraper. */
  async scrape() {
    await this.login();
    await this.findListings();
    while (this.moreListings()) {
      await this.processListing();
    }
    await this.writeListings();
    await this.writeStatistics();
  }
}
