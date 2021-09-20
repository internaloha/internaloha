import puppeteer from 'puppeteer-extra';
import fs from 'fs';
import Logger from 'loglevel';
import moment from 'moment';
import _ from 'lodash';
import pluginStealth from 'puppeteer-extra-plugin-stealth';
import randomUserAgent from 'random-useragent';
import { fetchInfo, autoScroll, startBrowser, writeToJSON } from './scraper-functions.js';

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
  async login(name, page) {
    const credentials = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
    await page.type('input[id="user_email"]', credentials.angellist.user);
    await page.type('input[id="user_password"]', credentials.angellist.password);
    await page.click('input[class="c-button c-button--blue s-vgPadLeft1_5 s-vgPadRight1_5"]');
  }

  /**
   * Search for internship listings.
   * This can yield either a set of URLs to pages with listings, or a single page with all the listings.
   * @throws Error if the search generates an error, or if it does not yield minimumListings.
   */
  search(page) {
    const results = [];
    for (let i = 0; i < 6; i++) {
      //get the title, company, description, city, state, and zip
      results.push(fetchInfo(page, 'div[class="styles_description__4fnTp"]', 'innerHTML') ));
      results.push(fetchInfo(page, 'div[class="styles_component__1iUh1"] > div:nth-child(1) > dd > div > span', 'innerText'));
      results.push(fetchInfo(page, 'h2[class="styles_component__1kg4S styles_header__3m1pY __halo_fontSizeMap_size--2xl __halo_fontWeight_medium"]', 'innerText'));
      results.push(fetchInfo(page, 'a[class="styles_component__1c6JC styles_defaultLink__1mFc1 styles_anchor__2aXMZ"]', 'innerText'));
    }
  }

  /**
   * Sets an internal cursor to point to the next listing to be parsed.
   * @return false if there are no more listings to parse.
   * @throws Error if a problem occurred getting the next listing.
   */
  nextListing() {}

  /**
   * Parses the current listing.
   * Adds the parsed listing to an internal object.
   * @throws Error if a problem occurred parsing this listing.
   *
  parseListing() {}

  /**
   * Writes the listings to the outputFilePath.
   * @throws Error if a problem occurred writing the listings.
   */
  async writeListings(page, urls) {
    const data = [];
    const totalPage = await page.evaluate(() => document.querySelectorAll('ul[class="pagination"] li').length);
    try {
      for (let i = 0; i <= urls.length; i++) {
        await page.goto(urls[i]);
        const lastScrapped = new Date();
        const [position, company, description, city, state, zip] = await getData(page);
        data.push({
          url: urls[i],
          position: position,
          company: company.trim(),
          location: { city: city, state: state, zip: zip },
          lastScrapped: lastScrapped,
          description: description,
        });
      }
    } catch (err1) {
      Logger.error(err1.message);
    }
    await writeToJSON(data, page.name);
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
  async writeStatistics(data) {
    await fs.writeFileSync('./data/canonical/angellist.canonical.data.json', JSON.stringify(data, null, 4),
        (err2) => {
          if (err2) {
            Logger.warn(data., err2);
          }
        });
    Logger.error(`Elapsed time for angellist: ${moment(startTime).fromNow(true)} | ${data.length} listings scraped `);
  }
}
