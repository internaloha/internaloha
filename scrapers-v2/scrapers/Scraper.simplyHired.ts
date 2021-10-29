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

export class SimplyHiredScraper extends Scraper {
  private timeout: number;
  private searchTerms: string;

  constructor() {
    super({ name: 'simplyHired', url: 'https://www.simplyhired.com' });
  }

  async launch() {
    await super.launch();
    prefix.apply(this.log, { nameFormatter: () => this.name.toUpperCase() });
    this.log.warn(`Launching ${this.name.toUpperCase()} scraper`);
    this.log.debug(`Discipline: ${this.discipline}`);
    // check the config file for timeout.
    // this.timeout = this.config?['additionalParams']?['simplyHired']?['timeout'] || 500;
    this.timeout = super.getNested(this.config, 'additionalParams', 'simplyHired', 'timeout') || 500;
    // check the config file to set the search terms.
    //this.searchTerms = this.config?.additionalParams?.simplyHired?.searchTerms[this.discipline] || 'computer science intern';
    this.searchTerms = super.getNested(this.config, 'additionalParams', 'simplyHired', 'searchTerms', this.discipline) || 'computer science intern';
    this.log.debug(`Search Terms: ${this.searchTerms}`);
  }

  async login() {
    super.login();
    this.log.debug(`Going to ${this.url}`);
    await this.page.goto(this.url);
  }

  async setUpSearchCriteria() {
    await this.page.waitForSelector('input[name=q]');
    await this.page.$eval('input[name=l]', (el) => {
      // eslint-disable-next-line no-param-reassign
      el.value = '';
    }, {});
    await this.page.type('input[name=q]', this.searchTerms);
    await Promise.all([
      this.page.click('button[type="submit"]'),
      this.page.waitForNavigation()
    ]);
    this.log.debug(`Inputted search query: ${this.searchTerms}`);
    await this.page.waitForSelector('div[data-id=JobType]');
    // Getting href link for internship filter
    const internshipDropdown = await super.getValues('a[href*="internship"]', 'href');
    if (internshipDropdown.length > 0) {
      const url = `${internshipDropdown[0]}`;
      this.log.debug(`Directing to: ${url}`);
      await Promise.all([
        this.page.goto(url),
        this.page.waitForSelector('div[data-id=JobType]'),
      ]);
      // Setting filter as last '30 days'
      const lastPosted = await super.getValues('div[data-id=Date] a[href*="30"]', 'href');
      const lastPostedURL = `${lastPosted[0]}`;
      this.log.debug('Setting Date Relevance: 30 days');
      this.log.debug(`Directing to: ${lastPostedURL}`);
      await this.page.goto(lastPostedURL);
      await Promise.all([
        this.page.click('a[class=SortToggle]'),
        this.page.waitForNavigation()
      ]);
      // Filtering by most recent
      this.log.debug('Filtering by: Most recent');
    } else {
      this.log.warn(`There are no internships with the search query: \'${this.searchTerms}\'`);
    }
  }

  async processPage(pageNumber) {
    let internshipsPerPage = 0;
    await this.page.waitForSelector('.SerpJob-jobCard.card');
    const elements = await this.page.$$('.SerpJob-jobCard.card');
    this.log.debug('Processing page', (pageNumber + 1), ': ', elements.length, ' internships');
    const urls = await super.getValues('a[class="SerpJob-link card-link"]', 'href');
    // this.log.debug(`URLS: \n${urls}`);
    for (let i = 1; i <= elements.length; i++) {
      await this.page.waitForTimeout(this.timeout);
      // await this.page.waitForSelector('div[class="viewjob-jobDescription"]');
      const element = elements[i];
      const positionVal = await super.getValues('div[class="viewjob-jobTitle h2"]', 'innerText');
      let position;
      if (positionVal.length > 0) {
        position = positionVal[0].trim();
      }
      const companyVal = await super.getValues('div[class="viewjob-header-companyInfo"] div:nth-child(1)', 'innerText');
      let company;
      if (companyVal.length > 0) {
        company = companyVal[0];
        // strip off the rating for the company
        const ratingIndex = company.lastIndexOf('-');
        if (ratingIndex !== -1) {
          company = company.substring(0, ratingIndex).trim();
        }
      } else {
        company = 'N/A';
        this.log.trace('No company found');
      }
      const locationObj = await super.getValues('div[class="viewjob-header-companyInfo"] div:nth-child(2)', 'innerText');
      if (locationObj.length > 1) {
        this.log.debug(`Multiple locations for ${company}: ${position}`);
      }
      const locationStr = `${locationObj}`;
      const description = await super.getValues('div[class="viewjob-jobDescription"]', 'innerHTML');
      const postedVal = await super.getValues('span[class="viewjob-labelWithIcon viewjob-age"]', 'innerText');
      let posted = '';
      if (postedVal.length > 0) {
        posted = convertPostedToDate(postedVal[0].toLowerCase()).toLocaleDateString();
      } else {
        posted = 'N/A';
        this.log.trace('No date found. Setting posted as: N/A');
      }
      this.log.trace(`Position: ${position}`);
      this.log.trace(`Company: ${company}`);
      this.log.trace(`Posted: ${posted}`);
      // this.log.debug(`LocationStr: ${locationStr} ${typeof locationStr}`);
      // this.log.debug(`Description: ${description}`);
      const url = urls[i - 1];
      const lSplit = locationStr.split(', ');
      // this.log.debug(`${lSplit.length}`);
      const city = (lSplit.length > 0) ? lSplit[0] : '';
      const state = (lSplit.length > 1) ? lSplit[1] : '';
      const country = '';
      this.log.trace(`Location: {${city}, ${state}, ${country}}`);
      const location = { city, state, country };

      // this.log.debug(`Position: \n${position}`);
      // this.log.debug(`Company: \n${company}`);
      // this.log.debug(`Location: \n${location}`);
      // this.log.debug(`Description: \n${description}`);
      const listing = new Listing({ url, location, position, description, company, posted });
      // this.log.debug(`${listing}`);
      this.listings.addListing(listing);
      internshipsPerPage++;
      // this.log.info(`Listing length: ${this.listings.length()}`);
      if (i < elements.length) {
        await Promise.all([
          element.click(),
          this.page.waitForNavigation(),
        ]);
      }
    }
    return internshipsPerPage;
  }

  async generateListings() {
    await super.generateListings();
    await this.setUpSearchCriteria();
    let totalPages = 0;
    let totalInternships = 0;
    let hasNext = true;
    do {
      totalInternships += await this.processPage(totalPages);
      const nextPage = await this.page.$('a[class="Pagination-link next-pagination"]');
      if (!nextPage) {
        hasNext = false;
        this.log.info('Reached the end of pages!');
      } else {
        await Promise.all([
          nextPage.click(),
          this.page.waitForNavigation()
        ]);
        totalPages++;
        const message = `Processed page ${totalPages}, ${totalInternships} total internships`;
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        ((totalPages === 1) || (totalPages % 10 === 0)) ? this.log.info(message) : this.log.debug(message);
      }
    } while (hasNext === true);
    this.log.debug(`Found ${totalPages} pages.`);
  }

  async processListings() {
    await super.processListings();
    // No post-processing (yet) for Simply Hired scraper results.
  }

}
