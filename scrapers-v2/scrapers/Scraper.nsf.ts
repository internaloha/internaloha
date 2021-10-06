import { Scraper } from './Scraper';

const prefix = require('loglevel-plugin-prefix');

export class NsfScraper extends Scraper {
  private listingUrls: string[];
  constructor() {
    super({ name: 'nsf', url: 'https://www.nsf.gov/crssprgm/reu/list_result.jsp?unitid=5049' });
    this.listingUrls = [];
    console.log(this.listingUrls);
  }

  async launch() {
    await super.launch();
    prefix.apply(this.log, { nameFormatter: () => this.name });
  }

  async login() {
    super.login();
    await this.page.goto(this.url);
  }

  async processListings() {
    super.processListings();
    await this.page.goto('https://www.nsf.gov/crssprgm/reu/list_result.jsp?unitid=5049');
    await this.page.waitForSelector('button[id="itemsperpage_top"]');
    await this.page.click('button[id="itemsperpage_top"]');
    await this.page.waitForSelector('a[onclick="showItemsPerPageForm(event, \'All\', \'?unitid=5049\')"]');
    await this.page.click('a[onclick="showItemsPerPageForm(event, \'All\', \'?unitid=5049\')"]');
    await this.page.waitForSelector('td[data-label="Site Information: "] > div > a');
    await this.page.waitForSelector('td[data-label="Site Information: "] > div > a');
    // Generate a set of parallel arrays containing the fields to be put into each listing.
    // Each array should be the same length, and each positional element should refer to the same listing.
    const urls = await this.page.evaluate(() => {
      const vals = [];
      const nodes = document.querySelectorAll('td[data-label="Site Information: "] > div > a');
      nodes.forEach(node => vals.push(node['href']));
      return vals;
    });
    this.log.debug(`URLS: ${urls}`);
    const positions = await this.page.evaluate(() => {
      const vals = [];
      const nodes = document.querySelectorAll('td[data-label="Site Information: "] > div > a');
      nodes.forEach(node => vals.push(node['innerText']));
      return vals;
    });
    this.log.debug(`Positions: ${positions}`);
  }
}
