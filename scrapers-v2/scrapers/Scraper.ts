import log from 'loglevel';
import chalk from 'chalk';
import puppeteer from 'puppeteer-extra';
import { Listings } from './Listings';
import * as prefix from 'loglevel-plugin-prefix';
import * as moment from 'moment';
import * as fs from 'fs';
import * as randomUserAgent from 'random-useragent';

// For some reason, the following package(s) generate TS errors if I use import.
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

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
  // public fields are set by the scrape.ts script.
  public config: object;
  public defaultTimeout: number;
  public devtools: boolean;
  public discipline;
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
  protected startTime: Date;
  protected endTime: Date;
  protected errorMessages: string[];

  /** Initialize the scraper state and provide configuration info. */
  constructor({ name, url }) {
    this.name = name;
    this.url = url;
    this.log = log;
    this.errorMessages = [];
  }

  /**
   * Return a list of field values based on selector.
   * @param selector The nodes to be selected from the current page.
   * @param field The field to extract from the nodes returned from the selector.
   */
  async getValues(selector, field) {
    return await this.page.$$eval(selector, (nodes, field) => nodes.map(node => node[field]), field);
  }

  /**
   * Return true if the passed selector appears on the page.
   */
  async selectorExists(selector) {
    return !! await this.page.$(selector);
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
    const listingSubDir = `${this.listingDir}/${this.discipline}`;
    this.listings = new Listings({ listingDir: listingSubDir, name: this.name, log: this.log, commitFiles: this.commitFiles });

    this.startTime = new Date();

    puppeteer.use(StealthPlugin());
    this.browser = await puppeteer.launch({ headless: this.headless, devtools: this.devtools, slowMo: this.slowMo });
    const context = await this.browser.createIncognitoBrowserContext();
    this.page = await context.newPage();
    await this.page.setViewport({ width: this.viewportWidth, height: this.viewportHeight });
    await this.page.setUserAgent(randomUserAgent.getRandom());
    await this.page.setDefaultTimeout(this.defaultTimeout);
    // Echo console messages from puppeteer in this process
    this.page.on('console', (msg) => this.log.debug(`PUPPETEER CONSOLE: ${msg.text()}`));
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
    this.listings.writeListings();
  }

  /**
   * Writes out statistics about this run.
   * Subclass: generally no need to override.
   */
  async writeStatistics() {
    this.log.debug('Starting write statistics');
    const elapsedTime = Math.trunc((this.endTime.getTime() - this.startTime.getTime()) / 1000);
    const numErrors = this.errorMessages.length;
    const numListings = this.listings.length();
    const suffix = this.commitFiles ? 'json' : 'dev.json';
    const dateString = moment().format('YYYY-MM-DD');
    const filename = `${this.statisticsDir}/${this.discipline}/${this.name}-${dateString}.${suffix}`;
    try {
      const data = { date: dateString, elapsedTime, numErrors, numListings, errorMessages: this.errorMessages, scraper: this.name };
      const dataString = JSON.stringify(data, null, 2);
      fs.writeFileSync(filename, dataString, 'utf-8');
      this.log.info('Wrote statistics.');
    } catch (error) {
      this.log.error(`Error in Scraper.writeStatistics: ${error}`);
    }
  }

  /**
   * Perform any final close-down operations.
   * Subclass: generally no need to override.
   */
  async close() {
    this.log.debug('Starting close');
    this.endTime = new Date();
    await this.browser.close();
    if (this.listings.length() < this.minimumListings) {
      this.log.error(`Generated listings (${this.listings.length()}) less than minimum listings (${this.minimumListings})`);
    }
  }

  /**
   * Runs the scraper.
   * Subclass: do not override.
   */
  async scrape() {
    try {
      await this.launch();
      await this.login();
      await this.generateListings();
      await this.processListings();
    } catch (error) {
      const message = error['message'];
      this.errorMessages.push(message);
      this.log.error(`Error caught in scrape(): ${message}`);
    } finally {
      await this.close();
      await this.writeListings();
      await this.writeStatistics();
    }
  }
}
