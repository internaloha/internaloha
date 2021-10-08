import { Scraper } from './Scraper';

const prefix = require('loglevel-plugin-prefix');

export class TemplateScraper extends Scraper {
  constructor() {
    super({ name: 'template', url: 'https://testscrapersite.com' });
  }

  async launch() {
    await super.launch();
    prefix.apply(this.log, { nameFormatter: () => this.name.toUpperCase() });
    this.log.info('Launching scraper.');
  }

  async login() {
    await super.login();
    // if you need to login, put that code here.
  }

  async generateListings() {
    await super.generateListings();
    // here is where you traverse the site and populate your this.Listings field with the listings.
  }

  async processListings() {
    await super.processListings();
    // here is where you do any additional processing on the raw data now available in the this.listings field.
  }

}
