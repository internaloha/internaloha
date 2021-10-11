import { Listing } from './Listing';
import { Scraper } from './Scraper';

const prefix = require('loglevel-plugin-prefix');

export class ZipRecruiterScraper extends Scraper {
  constructor() {
    super({ name: 'Zip:', url: 'https://www.ziprecruiter.com/' });
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
    await this.page.goto('https://www.ziprecruiter.com/');
    await this.page.waitForSelector('input[id="search1"]');
    await this.page.waitForSelector('input[id="location1"]');
    const searchQuery = 'computer science internship';
    await this.page.type('input[id="search1"', searchQuery);
    await this.page.$eval('input[id="location1"]', (el) => el.value = 'US');
    await this.page.click('button.job_search_hide + input');
    await this.page.mouse.click(1, 1);
    await this.page.waitForSelector('.modal-dialog');
    await this.page.mouse.click(1000, 800);
    await this.page.waitForTimeout(5000);
    const urls = await this.page.evaluate(() => {
      const vals = [];
    });
  }
}
