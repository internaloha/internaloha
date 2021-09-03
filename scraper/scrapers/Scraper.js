import puppeteer from 'puppeteer-extra';
import fs from 'fs';
import Logger from 'loglevel';
import moment from 'moment';
import _ from 'lodash';
import pluginStealth from 'puppeteer-extra-plugin-stealth';
import randomUserAgent from 'random-useragent';
import { fetchInfo, autoScroll } from './scraper-functions.js';

const credentials = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

export class Scraper {
  /** Initialize the scraper state and provide configuration info.
   *  constructor(name, url, credentials, minimumListings, listingFilePath, statisticsFilePath) {}
   * */
  /**
   * Go to the site and perform any login necessary.
   * @throws Error if login fails or site cannot be found.
   */
  /**
   * login() {
   *  // Navigate to login page
   *  await page.type('input[id="user_email"]', credentials.name.user);
   *  await page.type('input[id="user_password"]', credentials.name.password);
   *  await page.click('input[class="c-button c-button--blue s-vgPadLeft1_5 s-vgPadRight1_5"]');
   * }
  */
  /**
   * Search for internship listings.
   * This can yield either a set of URLs to pages with listings, or a single page with all the listings.
   * @throws Error if the search generates an error, or if it does not yield minimumListings.
   */
  /**
   * search() {
   * const data = [];
   * const scrapperName = this.name+":";
   * const startTime = new DATE();
   * try {
   *    Logger.error('Starting scraper' + name + 'at', moment().format('LT'));
   *    puppeteer.use(pluginStealth());
   *    const { browser, page } = await startBrowser();
   *    await page.setViewport({ width: 1366, height: 768 });
   *    await page.setUserAgent(userAgent);
   *    await page.setDefaultTimeout(0);
   *    await page.goto(url, { waitUntil: 'load', timeout: 0 });
   *    if the name is anglelist or then do a login
   *    await page.goto(url);
   *    await page.waitForNavigation;
   * }
   * }
   */
}
