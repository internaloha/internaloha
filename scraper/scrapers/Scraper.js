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
   *  switch(name) {
   *    case angellist:
   *        await page.type('input[id="user_email"]', credentials.name.user);
   *        await page.type('input[id="user_password"]', credentials.name.password);
   *        await page.click('input[class="c-button c-button--blue s-vgPadLeft1_5 s-vgPadRight1_5"]');
   *        break;
   *    case 'SOC':
   *        await page.goto('https://app.studentopportunitycenter.com/auth/login');
            await page.click(USERNAME_SELECTOR);
            await page.keyboard.type(credentials.studentOpportunityCenter.user);
            await page.click(PASSWORD_SELECTOR);
            await page.keyboard.type(credentials.studentOpportunityCenter.password);
            await page.click(CTA_SELECTOR);
            await page.waitForNavigation();
   *        break;
   *     default:
   *        break;
   *  }
   * }
  */
  /**
   * Search for internship listings.
   * This can yield either a set of URLs to pages with listings, or a single page with all the listings.
   * @throws Error if the search generates an error, or if it does not yield minimumListings.
   */
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
