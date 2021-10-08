//import fs from 'fs';
import log from 'loglevel';
import chalk from 'chalk';
import puppeteer from 'puppeteer-extra';
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
  protected errors: string[];

  /** Initialize the scraper state and provide configuration info. */
  constructor({ name, url }) {
    this.name = name;
    this.url = url;
    this.log = log;
    this.errors = [];
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
    // const elapsedTimeSeconds = Math.trunc((this.endTime.getTime() - this.startTime.getTime()) / 1000);
    // const numErrors = this.errors.length;
    // const filename
    // try {
    //   const suffix = this.commitFiles ? 'json' : 'dev.json';
    //   const file = `${this.statisticsDir}/${this.discipline}/${this.name}.${suffix}`;
    //   const data = JSON.stringify(this.listings, null, 2);
    //   fs.writeFileSync(file, data, 'utf-8');
    //   this.log.info('Wrote data');
    // } catch (error) {
    //   this.log.error(`Error in Listings.writeListings: ${error}`);
    // }
  }

  /**
   * Perform any final close-down operations.
   * Subclass: generally no need to override.
   */
  async close() {
    this.log.debug('Starting close');
    this.endTime = new Date();
    await this.browser.close();
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
      this.errors.push(error['message']);
    } finally {
      await this.close();
      await this.writeListings();
      await this.writeStatistics();
    }
  }
}
