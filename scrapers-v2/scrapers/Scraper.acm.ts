import { Scraper } from './Scraper';
import { Listing } from './Listing';

const prefix = require('loglevel-plugin-prefix');

/**
 * Converts posted strings to ISO format. This is ONLY if it follows the format of:
 * Posted: 4 days ago... 3 weeks ago... a month ago
 * @param posted The string
 * @returns {Date}
 */
function convertPostedToDate(posted) {
  const date = new Date();
  let daysBack: number;
  if (posted.includes('hours') || (posted.includes('hour')) || (posted.includes('minute'))
    || (posted.includes('minutes')) || (posted.includes('moment')) || (posted.includes('second'))
    || (posted.includes('seconds')) || (posted.includes('today'))) {
    daysBack = 0;
  } else if ((posted.includes('week')) || (posted.includes('weeks'))) {
    daysBack = posted.match(/\d+/g) * 7;
  } else if ((posted.includes('month')) || (posted.includes('months'))) {
    daysBack = posted.match(/\d+/g) * 30;
  } else {
    daysBack = posted.match(/\d+/g);
  }
  date.setDate(date.getDate() - daysBack);
  return date;
}

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
    // this.searchTerms = this.config?.additionalParams?.acm?.searchTerms[this.discipline] || 'intern';
    this.searchTerms = super.getNested(this.config, 'additionalParams', 'acm', 'searchTerms', this.discipline) || 'internship';
    this.log.debug(`Search Terms: ${this.searchTerms}`);
  }

  async login() {
    await super.login();
    const searchUrl = `https://jobs.acm.org/jobs/?keywords=${this.searchTerms}&pos_flt=0&location=United+States&location_completion=city=$state=$country=United+States&location_type=country&location_text=United+States&location_autocomplete=true`;
    this.log.debug(`Going to ${searchUrl}`);
    await this.page.goto(searchUrl);
  }

  async processPage() {
    await this.page.waitForSelector('.job-result-tiles .job-tile');
    const tiles = await this.page.$$('.job-result-tiles .job-tile');
    const positions = await super.getValues('.job-result-tiles .job-tile .job-detail-row .job-title', 'innerText');
    const urls = await super.getValues('.job-result-tiles .job-tile .job-detail-row .job-title', 'href');
    const companies = await super.getValues('.job-result-tiles .job-tile .job-company-row', 'innerText');
    const locations = await super.getValues('.job-result-tiles .job-tile .job-location', 'innerText');
    this.log.debug(tiles.length, positions.length, companies.length, locations.length);
    for (let i = 0; i < positions.length; i++) {
      await this.page.waitForTimeout(1000);
      const position = positions[i];

      if (position.includes('intern') || position.includes('Intern')) {
        this.log.debug(position);
        // if (i !== 0) {
        await Promise.all([
          tiles[i].click(),
          this.page.waitForTimeout(2500), // 1500 is not long enough
          // this.page.waitForNavigation({
          //   waitUntil: 'networkidle0',
          // }),
          // this.page.waitForSelector('#job-results-details.job-results-details'),
        ]);
        // }
        const company = companies[i].trim();
        const locationStr = locations[i];
        const url = urls[i];
        const lSplit = locationStr.split(', ');
        // this.log.debug(`${lSplit.length}`);
        const city = (lSplit.length > 0) ? lSplit[0] : '';
        const state = (lSplit.length > 1) ? lSplit[1] : '';
        const country = (lSplit.length > 2) ? lSplit[2] : '';
        this.log.trace(`Location: {${city}, ${state}, ${country}}`);
        const location = { city, state, country };
        const postedArr = await super.getValues('#job-results-details.job-results-details .job-main-data .job-subtext-row .job-posted-date', 'innerText');
        let posted;
        if (postedArr.length > 0) {
          posted = convertPostedToDate(postedArr[0].toLowerCase()).toLocaleDateString();
        } else {
          posted = 'N/A';
          this.log.trace('No date found. Setting posted as: N/A');
        }
        const description = await super.getValues('.job-results-details .job-desc', 'innerHTML');
        this.log.trace(`URLS: ${urls}`);
        this.log.trace(`Posted: ${postedArr}`);
        this.log.trace(`Description: ${description}`);
        const listing = new Listing({ url, location, position, description, company, posted });
        this.listings.addListing(listing);
      }
    }
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
