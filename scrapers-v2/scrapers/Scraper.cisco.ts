import { Scraper } from './Scraper';
import {Listing} from './Listing';

const prefix = require('loglevel-plugin-prefix');

export class CiscoScraper extends Scraper {
  constructor() {
    super({ name: 'cisco', url: 'https://jobs.cisco.com/jobs/SearchJobs/?21178=%5B169482%5D&21178_format=6020&21180=%5B165%5D&21180_format=6022&21181=%5B186%2C194%2C201%2C187%2C191%2C196%2C197%2C67822237%2C185%2C55816092%5D&21181_format=6023&listFilterMode=1' });
  }

  async launch() {
    await super.launch();
    prefix.apply(this.log, { nameFormatter: () => this.name.toUpperCase() });
    this.log.info('Launching scraper.');
  }

  async login() {
    super.login();
  }

  async generateListings() {
    super.generateListings();
    await this.page.goto(this.url);

    const nextLink = 'div[class="pagination autoClearer"] a:last-child';
    const urls = [];
    do {
      // process page
      urls.push(await super.getValues('table[class="table_basic-1 table_striped"] tbody tr td[data-th="Job Title"] a', 'href'));

      await this.page.click('div[class="pagination autoClearer"] a:last-child');
    } while (await super.selectorExists(nextLink));
    this.log.debug(`URLS: \n${urls}`);
    this.log.debug(`URL length: \n${urls.length}`);
    const descriptions = [];
    const positions = [];
    const locations = [];
    const cities = [];
    const states = [];
    this.log.debug(`URL: \n${urls[0]}`);
    const urlTemp = urls[0];
    const urlArr = urlTemp.slice(',');
    this.log.debug(`URL length: \n${urlArr.length}`);
    for (const url of urlArr) {
      this.log.debug(`URL: \n${url}`);

      await this.page.goto(url);
      positions.push(await super.getValues('h2[itemprop="title"]', 'innerText'));
      descriptions.push(await super.getValues('div[itemprop="description"]', 'innerText'));
      let location: any[];
      location = await super.getValues('div[itemprop="jobLocation"]', 'innerText');
      locations.push(location);
      location.forEach(location => {
        const loc = location.split(', ');
        this.log.debug(`Location: \n${loc}`);
        cities.push(loc[0]);
        states.push(loc[1]);
      });
    }

    // Now we add listings. All arrays are (hopefully!) the same length.
    for (let i = 0; i < urlArr.length; i++) {
      const location = { city: cities[i], state: states[i], country: '' };
      const listing = new Listing({ url: urlArr[i], position: positions[i], location, company: 'Cisco', description: descriptions[i] });
      this.listings.addListing(listing);
    }
  }

  async processListings() {
    await super.processListings();
    // Not yet implemented.
  }
}
