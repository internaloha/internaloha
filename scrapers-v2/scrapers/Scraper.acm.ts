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
    // this.searchTerms = this.config?.additionalParams?.acm?.searchTerms[this.discipline] || 'intern';
    this.searchTerms = super.getNested(this.config, 'additionalParams', 'acm', 'searchTerms', this.discipline) || 'internship';
    this.log.debug(`Search Terms: ${this.searchTerms}`);
  }

  async login() {
    await super.login();
    // https://jobs.acm.org/jobs/?keywords=Internship&pos_flt=0&location=United+States&location_completion=city%3D%24state%3D%24country%3DUnited+States&location_type=country&location_text=United+States&location_autocomplete=true
    const searchUrl = `https://jobs.acm.org/jobs/?keywords=${this.searchTerms}&pos_flt=0&location=United+States&location_completion=city%3D%24state%3D%24country%3DUnited+States&location_type=country&location_text=United+States&location_autocomplete=true`;
    this.log.debug(`Going to ${searchUrl}`);
    await this.page.goto(searchUrl);
  }

  async processPage() {
    await this.page.waitForSelector('.job-result-tiles .job-tile');
    const positions = await super.getValues('.job-result-tiles .job-tile .job-detail-row .job-title', 'innerText');
    const companies = await super.getValues('.job-result-tiles .job-tile .job-company-row', 'innerText');
    const locations = await super.getValues('.job-result-tiles .job-tile .job-location', 'innerText');
    this.log.debug(positions.length, companies.length, locations.length);
  }

  async generateListings() {
    await super.generateListings();
    await this.processPage();
  }

  async processListings() {
    await super.processListings();
    // No post-processing (yet) for ACM scraper results.
  }
}
