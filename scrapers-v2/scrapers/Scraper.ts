import log from 'loglevel';
import chalk from 'chalk';
import puppeteer from 'puppeteer-extra';

// For some reason, the following packages generate TS errors if I use import.
const prefix = require('loglevel-plugin-prefix');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const randomUserAgent = require('random-useragent');

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

/**
 * Abstract superclass providing the structure and supporting functions for all scrapers.
 */
export class Scraper {
  // public fields are set by the main.ts script.
  public config: object;
  public defaultTimeout: number;
  public devtools;
  public headless: boolean;
  public listingDir: string;
  public log: any;
  public minimumListings: number;
  public slowMo: number;
  public statisticsDir: string;
  public viewportHeight: number;
  public viewportWidth: number;
  // protected fields are set by the subclass.
  protected browser;
  protected name: string;
  protected page;
  protected url: string;

  /** Initialize the scraper state and provide configuration info. */
  constructor({ name, url }) {
    this.name = name;
    this.url = url;
    this.log = log;
    this.log.debug(`Creating scraper: ${this.name}`);
  }

  /** Allow CLI access to the name of this scraper. (Subclass: do not override). */
  getName() {
    return this.name;
  }

  /** Set up puppeteer. (Subclass: do not override.) */
  async launch() {
    this.log.debug('Starting launch');
    puppeteer.use(StealthPlugin());
    this.browser = await puppeteer.launch({ headless: this.headless, devtools: this.devtools, slowMo: this.slowMo });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: this.viewportWidth, height: this.viewportHeight });
    await this.page.setUserAgent(randomUserAgent.getRandom());
    await this.page.setDefaultTimeout(this.defaultTimeout);
  }

  /** Login to site. (Subclass: must override.) */
  async login() {
    this.log.debug('Starting login');
  }

  /**
   * Search for internship listings. (Subclass: must override.)
   * This should set some kind of internal state to represent all of the relevant listings at this site.
   * @throws Error if the search generates an error, or if it does not yield minimumListings.
   */
  async findListings() {
    this.log.debug('Starting find listings');
  }

  /**
   * True if there is a remaining listing to be processed by processListing. (Subclass: must override.)
   */
  moreListings() {
   return false;
  }

  /**
   * Processes the current listing and changes internal state to point to the next listing if available. (Subclass: must override.)
   * Processing means extracting the relevant information for writing.
   * @throws Error if a problem occurred parsing this listing.
   */
  async processListing() {
    this.log.debug('Starting process listing');
  }

  /**
   * Writes the listings to a file in listingFilePath. (Subclass: generally no need to override.)
   * @throws Error if a problem occurred writing the listings.
   */
  async writeListings() {
    this.log.debug('Starting write listings');
  }

  /**
   * Appends a line to the statisticsFilePath with statistics about this run. (Subclass: generally no need to override.)
   * The statistics file is in CSV format.
   * Statistics include:
   *   * Name of scraper
   *   * Date and time of the run.
   *   * Elapsed time for this run.
   *   * Total number of listings found.
   *   * Any errors thrown (including short description)
   */
  async writeStatistics() {
    this.log.debug('Starting write statistics');
  }

  /**
   * Perform any final close-down operations. (Subclass: may not need to override.)
   */
  async close() {
    await this.browser.close();
  }

  /**
   * Runs the scraper.  (Subclass: no need to override.)
   */
  async scrape() {
    await this.launch();
    await this.login();
    await this.findListings();
    while (this.moreListings()) {
      await this.processListing();
    }
    await this.writeListings();
    await this.writeStatistics();
    await this.close();
  }
}
