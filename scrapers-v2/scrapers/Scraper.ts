import log from 'loglevel';
import chalk from 'chalk';
import puppeteer from 'puppeteer-extra';
// eslint-disable-next-line no-unused-vars
import { Listings } from './Listings';

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

/**
 * Abstract superclass providing the structure and supporting functions for all scrapers.
 */
export class Scraper {
  // public fields are set by the main.ts script.
  public config: object;
  public defaultTimeout: number;
  public devtools: boolean;
  public commitFiles: boolean;
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
  protected listings: Listings;

  /** Initialize the scraper state and provide configuration info. */
  constructor({ name, url }) {
    this.name = name;
    this.url = url;
    this.log = log;
  }

  /**
   * Allow CLI access to the name of this scraper.
   * Subclass: do not override.
   */
  getName() {
    return this.name;
  }

  /**
   * Set up puppeteer.
   * Subclass: invoke `await super.launch()` first if you override.
   */
  async launch() {
    // Set up logging.
    prefix.reg(this.log);
    prefix.apply(this.log, {
      format(level, logname, timestamp) {
        const color = colors[level.toUpperCase()];
        return `${color(timestamp)} ${color(level)} ${color(logname)}`;
      },
    });

    // Set up the Listings object, now that we know the listingDir, name, and log.
    this.listings = new Listings({ listingDir: this.listingDir, name: this.name, log: this.log, commitFiles: this.commitFiles });

    this.log.debug('Starting launch');
    puppeteer.use(StealthPlugin());
    this.browser = await puppeteer.launch({ headless: this.headless, devtools: this.devtools, slowMo: this.slowMo });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: this.viewportWidth, height: this.viewportHeight });
    await this.page.setUserAgent(randomUserAgent.getRandom());
    await this.page.setDefaultTimeout(this.defaultTimeout);
  }

  /**
   * Login to site.
   * Subclass: invoke `await super.login()` if you need to override.
   */
  async login() {
    this.log.debug('Starting login');
  }

  /**
   * Scrapes the page and stores preliminary results in the this.listings field.
   * Subclass: invoke `await super.processListings()` when you override.
   * Processing means extracting the relevant information for writing.
   * @throws Error if a problem occurred parsing this listing.
   */
  async generateListings() {
    this.log.debug('Starting generate listings');
  }

  /**
   * After the this.listings field is populated, use this method to further process the data.
   * Subclass: invoke `await super.processListings` if you override.
   */
  async processListings() {
    this.log.debug('Starting processListings');
  }

  /**
   * Writes the listings to a file in listingFilePath.
   * Subclass: generally no need to override.
   */
  async writeListings() {
    this.log.debug('Starting write listings');
    this.listings.writeListings();
  }

  /**
   * Writes out statistics about this run.
   * Subclass: generally no need to override.
   */
  async writeStatistics() {
    this.log.debug('Starting write statistics');
  }

  /**
   * Perform any final close-down operations.
   * Subclass: generally no need to override.
   */
  async close() {
    this.log.debug('Starting close');
    await this.browser.close();
  }

  /**
   * Runs the scraper.
   * Subclass: do not override.
   */
  async scrape() {
    await this.launch();
    await this.login();
    await this.generateListings();
    await this.processListings();
    await this.writeListings();
    await this.writeStatistics();
    await this.close();
  }
}
