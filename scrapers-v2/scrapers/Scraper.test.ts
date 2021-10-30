import { Scraper } from './Scraper';

const prefix = require('loglevel-plugin-prefix');

/**
 * Test Scraper is a scraper you can use to fiddle around with. For example, if you're trying to understand request
 * headers or something and you don't want to edit a production scraper.
 */

export class TestScraper extends Scraper {
  constructor() {
    super({ name: 'test', url: 'https://headers.cloxy.net/request.php' });
  }

  async launch() {
    await super.launch();
    prefix.apply(this.log, { nameFormatter: () => this.name.toUpperCase() });
    this.log.warn(`Launching ${this.name.toUpperCase()} scraper`);
  }

  async login() {
    await super.login();
    console.log((await this.page.goto('https://example.org/')).request().headers());
    await this.page.goto(this.url);
    await this.page.waitForTimeout(100000);
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
