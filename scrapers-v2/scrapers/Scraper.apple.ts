import { Listing } from './Listing';
import { Scraper } from './Scraper';

const prefix = require('loglevel-plugin-prefix');

export class Apple extends Scraper {
  constructor() {
    super({ name: 'apple', url: 'https://jobs.apple.com/en-us/search?sort=relevance' });
  }

  async launch() {
    await super.launch();
    prefix.apply(this.log, { nameFormatter: () => this.name.toUpperCase() });
    this.log.warn(`Launching ${this.name.toUpperCase()} scraper`);
  }

  async login() {
    super.login();
    await this.page.goto(this.url);
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get the values associated with the passed selector and associated field.
   * Because we can't do closures with puppeteer, special arguments are needed to pass selector and field into page.evaluate().
   * See: https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pageevaluatepagefunction-args
   * Also: we have to create a returnVals variable and await it, then return it.
   * It's worth it because we call this function five times in generateListings.
   */
  public async getValuesOLD(selector, field) {
    const returnVals = await this.page.evaluate((selector, field) => {
      const vals = [];
      const nodes = document.querySelectorAll(selector);
      nodes.forEach(node => vals.push(node[field]));
      return vals;
    }, selector, field);
    return returnVals;
  }

  public async getValues(selector, field) {
    return await this.page.$$eval(selector, (nodes, field) => nodes.map(node => node[field]), field);
  }

  async generateListings() {
    await super.generateListings();
    await this.page.goto('https://jobs.apple.com/en-us/search?sort=relevance');
    await this.page.type('input[id="searchview"]', 'internship');
    await this.page.keyboard.press('Enter');
    await this.page.waitForSelector('button[id="locations-filter-acc"]');
    await this.page.click('button[id="locations-filter-acc"]');
    await this.page.waitForSelector('input[id="locations-filter-input"]');
    await this.page.click('input[id="locations-filter-input"]');

    // Separated 'United' and 'States' so that dropdown list comes out
    await this.page.type('input[id="locations-filter-input"]', 'United');
    await this.page.type('input[id="locations-filter-input"]', ' States');

    // Delay prevents code from bypassing page changes
    await this.delay(5000);
    await this.page.waitForSelector('li[id="locations-filter-input-option-0"]');
    await this.page.click('li[id="locations-filter-input-option-0"]');
    await this.delay(5000);

    // here is where you traverse the site and populate your this.Listings field with the listings.
    await this.page.waitForSelector('a[class="table--advanced-search__title"]');
    let urls = await this.getValues('a[class="table--advanced-search__title"]', 'href');


    // Now generate listings. All arrays are (hopefully!) the same length.
    for (let i = 0; i < urls.length; i++) {
      // const location = { city: cities[i], state: states[i], country: '' };
      await this.page.goto(urls[i]);
      // Positions
      const positions = await this.getValues('h1[itemprop="title"]', 'innerText');
      // Descriptions
      const descriptions = await this.getValues('div[id="jd-description"]', 'innerHTML');
      // States
      const states = await this.getValues('span[itemprop="addressRegion"]', 'innerText');
      //Cities
      const cities = await this.getValues('span[itemprop="addressLocality"]', 'innerText');

      const location = { city: cities, state: states, country: 'United States' };

      const listing = new Listing({
        url: urls[i], position: positions[i], location, company: 'Apple', description:
        descriptions
      });
      this.listings.addListing(listing);
    }
  }

  async processListings() {
    await super.processListings();
    // here is where you do any additional processing on the raw data now available in the this.listings field.
  }

}
