import { Scraper } from './Scraper';
// import { Listing } from './Listing';

const prefix = require('loglevel-plugin-prefix');

export class AcmScraper extends Scraper {
  private searchTerms: string;

  constructor() {
    super({ name: 'ACM', url: 'https://jobs.acm.org' });
  }

  async launch() {
    await super.launch();
    prefix.apply(this.log, { nameFormatter: () => this.name.toUpperCase() });
    this.log.warn(`Launching ${this.name.toUpperCase()} scraper`);
    this.log.debug(`Discipline: ${this.discipline}`);
    // check the config file to set the search terms.
    // @ts-ignore
    this.searchTerms = this.config?.additionalParams?.acm?.searchTerms[this.discipline] || 'intern';
    this.log.debug(`Search Terms: ${this.searchTerms}`);
  }

  async login() {
    super.login();
    this.log.debug(`Going to ${this.url}`);
    await this.page.goto(this.url);
  }

  async setUpSearchTerms() {
    await this.page.waitForSelector('input[id=keyword]');
    await this.page.type('input[id=keyword]', this.searchTerms);
    await Promise.all([
      this.page.click('button[type="submit"]'),
      this.page.waitForNavigation()
    ]);
    this.log.debug(`Inputted search query: ${this.searchTerms}`);
  }

  async generateListings() {
    await super.generateListings();
    await this.setUpSearchTerms();

  }

  async processListings() {
    await super.processListings();
    // No post-processing (yet) for ACM scraper results.
  }
}
