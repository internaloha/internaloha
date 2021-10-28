import { Scraper } from './Scraper';

const prefix = require('loglevel-plugin-prefix');

export class IndeedScrapper extends Scraper {
  constructor() {
    super({ name: 'indeed', url: 'https://www.indeed.com/jobs?q=computer%20science%20intern&vjk=9eff9928b08349d4' });
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
  }

}
