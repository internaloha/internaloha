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
    await this.page.goto(this.url);
  }

  async generateListings() {
    super.generateListings();
    await this.page.goto('https://jobs.cisco.com/jobs/SearchJobs/?21178=%5B169482%5D&21178_format=6020&21180=%5B165%5D&21180_format=6022&21181=%5B186%2C194%2C201%2C187%2C191%2C196%2C197%2C67822237%2C185%2C55816092%5D&21181_format=6023&listFilterMode=1');
    await this.page.waitForNavigation;
    let hasPage = await this.page.$('div[class="pagination autoClearer"] a:last-child');
    // Case when there is no "next" link.
    let urls;
    if (hasPage === null) {
      urls = await this.page.evaluate(() => {
        const vals = [];
        const nodes = document.querySelectorAll('table[class="table_basic-1 table_striped"] tbody tr td[data-th="Job Title"] a');
        nodes.forEach(node => vals.push(node['href']));
        return vals;
      });
      this.log.debug(`URLS: \n${urls}`);
    }
    // Case where there is a next link
    while (hasPage !== null) {
      urls = await this.page.evaluate(() => {
        const vals = [];
        const nodes = document.querySelectorAll('table[class="table_basic-1 table_striped"] tbody tr td[data-th="Job Title"] a');
        nodes.forEach(node => vals.push(node['href']));
        return vals;
      });
      this.log.debug(`URLS: \n${urls}`);
      await this.page.click('div[class="pagination autoClearer"] a:last-child');
      hasPage = await this.page.$('div[class="pagination autoClearer"] a:last-child');
    }
    const descriptions = [];
    const positions = [];
    const locations = [];
    const cities = [];
    const states = [];
    for (let j = 0; j < urls.length; j++) {
      await this.page.goto(urls[j]);
      // Create array of position titles.
      const position = await this.page.evaluate(() => {
        const vals = [];
        const nodes = document.querySelectorAll('h2[itemprop="title"]');
        nodes.forEach(node => vals.push(node['innerText']));
        return vals;
      });
      this.log.debug(`Position: \n${position}`);
      positions.push(position);

      // Create array of descriptions.
      const description = await this.page.evaluate(() => {
        const vals = [];
        const nodes = document.querySelectorAll('div[itemprop="description"]');
        nodes.forEach(node => vals.push(node['innerText']));
        return vals;
      });
      this.log.debug(`Description: \n${description}`);
      descriptions.push(description);

      // Create array of locations, then create arrays of cities and states from it.
      const location = await this.page.evaluate(() => {
        const vals = [];
        const nodes = document.querySelectorAll('div[itemprop="jobLocation"]');
        nodes.forEach(node => vals.push(node['innerText']));
        return vals;
      });
      this.log.debug(`Location: \n${location}`);
      locations.push((location));
      for (let i = 0; i < location.length; i++) {
        const loc = location[i].split(', ');
        this.log.debug(`Location: \n${loc}`);
        cities.push(loc[0]);
        states.push(loc[1]);
      }

    }

    // Now we add listings. All arrays are (hopefully!) the same length.
    for (let i = 0; i < urls.length; i++) {
      const location = { city: cities[i], state: states[i], country: 'United States' };
      const listing = new Listing({ url: urls[i], position: positions[i], location, description: descriptions[i] });
      this.listings.addListing(listing);
    }
  }

  async processListings() {
    await super.processListings();
    // Not yet implemented.
  }
}
