import { Scraper } from './Scraper';

const prefix = require('loglevel-plugin-prefix');

export class IndeedScrapper extends Scraper {
  constructor() {
    super({ name: 'indeed', url: 'https://www.indeed.com/jobs?q=USA%20(software%20or%20programmer)&explvl=entry_level&st=employer&vjk=6b53a7742ceabf5c' });
  }

  async launch() {
    await super.launch();
    prefix.apply(this.log, { nameFormatter: () => this.name.toUpperCase() });
    this.log.warn(`Launching ${this.name.toUpperCase()} scraper`);
  }

  async login() {
    await super.login();
    // if you need to login, put that code here.
    await this.page.goto(this.url);
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
