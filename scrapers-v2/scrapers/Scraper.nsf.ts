import { Listing } from './Listing';
import { Scraper } from './Scraper';

const prefix = require('loglevel-plugin-prefix');

export class NsfScraper extends Scraper {
  constructor() {
    super({ name: 'nsf', url: 'https://www.nsf.gov/crssprgm/reu/list_result.jsp?unitid=5049' });
  }

  async launch() {
    await super.launch();
    prefix.apply(this.log, { nameFormatter: () => this.name.toUpperCase() });
    this.log.info('Launching scraper.');
  }

  async login() {
    super.login();
    await this.page.goto(this.url);
  }

  /**
   * Get the values associated with the passed selector and associated field.
   * Because we can't do closures with puppeteer, special arguments are needed to pass selector and field into page.evaluate().
   * See: https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pageevaluatepagefunction-args
   * Also: we have to create a returnVals variable and await it, then return it.
   * It's worth it because we call this function four times in generateListings.
   */
  private async getValues(selector, field) {
    const returnVals = await this.page.evaluate((selector, field) => {
      const vals = [];
      const nodes = document.querySelectorAll(selector);
      nodes.forEach(node => vals.push(node[field]));
      return vals;
    }, selector, field);
    return returnVals;
  }

  async generateListings() {
    super.generateListings();
    await this.page.goto('https://www.nsf.gov/crssprgm/reu/list_result.jsp?unitid=5049');
    await this.page.waitForSelector('button[id="itemsperpage_top"]');
    await this.page.click('button[id="itemsperpage_top"]');
    await this.page.waitForSelector('a[onclick="showItemsPerPageForm(event, \'All\', \'?unitid=5049\')"]');
    await this.page.click('a[onclick="showItemsPerPageForm(event, \'All\', \'?unitid=5049\')"]');
    await this.page.waitForSelector('td[data-label="Site Information: "] > div > a');
    // Generate a set of parallel arrays containing the fields to be put into each listing.
    // Each array should be the same length, and each positional element should refer to the same listing.
    // Start by creating an array of URLs.
    let urls = await this.getValues('td[data-label="Site Information: "] > div > a', 'href');
    urls = urls.map(val => val.replace('https://www.nsf.gov/cgi-bin/good-bye?', ''));
    this.log.debug(`URLS: \n${urls}`);

    // Positions
    const positions = await this.getValues('td[data-label="Site Information: "] > div > a', 'innerText');
    this.log.debug(`Positions: \n${positions}`);

    // Descriptions
    const descriptions = await this.getValues('td[data-label="Additional Information: "] > div ', 'innerText');
    this.log.debug(`Descriptions: \n${descriptions}`);

    // Locations
    const locations = await this.getValues('td[data-label="Site Location: "] > div', 'innerText');
    this.log.debug(`Locations: \n${locations}`);
    const cities = [];
    const states = [];
    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i].split(', ');
      cities.push(loc[0]);
      states.push(loc[1]);
    }

    // Now generate listings. All arrays are (hopefully!) the same length.
    for (let i = 0; i < urls.length; i++) {
      const location = { city: cities[i], state: states[i] };
      const listing = new Listing({ url: urls[i], position: positions[i], location, description: descriptions[i] });
      this.listings.addListing(listing);
    }
  }

  async processListings() {
    await super.processListings();
    // No post-processing (yet) for NSF scraper results.
  }
}
