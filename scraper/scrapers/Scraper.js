import puppeteer from 'puppeteer-extra';
import fs from 'fs';
import Logger from 'loglevel';
import moment from 'moment';
import _ from 'lodash';
import pluginStealth from 'puppeteer-extra-plugin-stealth';
import randomUserAgent from 'random-useragent';
import { fetchInfo, autoScroll, startBrowser } from './scraper-functions.js';

export class Scraper {
  /** Initialize the scraper state and provide configuration info. * */
  constructor(name, url, credentials, minimumListings, listingFilePath, statisticsFilePath) {
    this.name = name;
    this.url = url;
    this.credentials = credentials;
    this.minimumListings = minimumListings;
    this.listingFilePath = listingFilePath;
    this.statisticsFilePath = statisticsFilePath;
  }

  /**
   * Go to the site and perform any login necessary.
   * @throws Error if login fails or site cannot be found.
   */

  async login(page, name) {
    const credentials = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
    const userName = credentials.name.user;
    const password = credentials.name.password;
    Logger.error('Starting scraper angellist at', moment().format('LT'));

  }

  /**
   * Search for internship listings.
   * This can yield either a set of URLs to pages with listings, or a single page with all the listings.
   * @throws Error if the search generates an error, or if it does not yield minimumListings.
   */
  async search(name, url) {
    const data = [];
    const startTime = new Date();
    puppeteer.use(pluginStealth());
    const { browser, page } = await startBrowser();
    await page.setViewport({ width: 1366, height: 768 });
    const userAgent = randomUserAgent.getRandom();


  }
  /**
   * search() {
   *
   * }
   *
   * Sets an internal cursor to point to the next listing to be parsed.
   * @return false if there are no more listings to parse.
   * @throws Error if a problem occurred getting the next listing.
   *
   *nextListing() {
   *
   *}
   *
   * parseListing() {
   *
   * }
   *
   * writeListings() {
   *
   * }
   *
   * writeStatistics() {
   *
   * }
   */
}
