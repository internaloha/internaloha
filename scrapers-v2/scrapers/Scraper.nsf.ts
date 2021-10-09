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

  async generateListings() {
    super.generateListings();
    await this.page.goto('https://www.nsf.gov/crssprgm/reu/list_result.jsp?unitid=5049');
    await this.page.waitForSelector('button[id="itemsperpage_top"]');
    await this.page.click('button[id="itemsperpage_top"]');
    await this.page.waitForSelector('a[onclick="showItemsPerPageForm(event, \'All\', \'?unitid=5049\')"]');
    await this.page.click('a[onclick="showItemsPerPageForm(event, \'All\', \'?unitid=5049\')"]');
    await this.page.waitForSelector('td[data-label="Site Information: "] > div > a');
    await this.page.waitForSelector('td[data-label="Site Information: "] > div > a');
    // Generate a set of parallel arrays containing the fields to be put into each listing.
    // Each array should be the same length, and each positional element should refer to the same listing.
    // Start by creating an array of URLs.
    const urls = await this.page.evaluate(() => {
      const vals = [];
      const nodes = document.querySelectorAll('td[data-label="Site Information: "] > div > a');
      nodes.forEach(node => vals.push(node['href']));
      return vals.map(val => val.replace('https://www.nsf.gov/cgi-bin/good-bye?', ''));
    });
    this.log.debug(`URLS: \n${urls}`);

    // Create array of position titles.
    const positions = await this.page.evaluate(() => {
      const vals = [];
      const nodes = document.querySelectorAll('td[data-label="Site Information: "] > div > a');
      nodes.forEach(node => vals.push(node['innerText']));
      return vals;
    });
    this.log.debug(`Positions: \n${positions}`);

    // Create array of descriptions.
    const descriptions = await this.page.evaluate(() => {
      const vals = [];
      const nodes = document.querySelectorAll('td[data-label="Additional Information: "] > div ');
      nodes.forEach(node => vals.push(node['innerText']));
      return vals;
    });
    this.log.debug(`Descriptions: \n${descriptions}`);

    // Create array of locations, then create arrays of cities and states from it.
    const locations = await this.page.evaluate(() => {
      const vals = [];
      const nodes = document.querySelectorAll('td[data-label="Site Location: "] > div');
      nodes.forEach(node => vals.push(node['innerText']));
      return vals;
    });
    this.log.debug(`Locations: \n${locations}`);
    const cities = [];
    const states = [];
    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i].split(', ');
      cities.push(loc[0]);
      states.push(loc[1]);
    }

    // Now we add listings. All arrays are (hopefully!) the same length.
    for (let i = 0; i < urls.length; i++) {
      const location = { city: cities[i], state: states[i] };
      const listing = new Listing({ url: urls[i], position: positions[i], location, description: descriptions[i] });
      this.listings.addListing(listing);
    }
  }

  async processListings() {
    await super.processListings();
    // Not yet implemented.
  }
}
