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

  constructor() {
    super({ name: 'simplyHired', url: 'https://www.simplyhired.com' });
  }

  /**
   * Get the values associated with the passed selector and associated field.
   */
  private async getValues(selector, field) {
    return await this.page.$$eval(selector, (nodes, field) => nodes.map(node => node[field]), field);
  }

  async launch() {
    await super.launch();
    prefix.apply(this.log, { nameFormatter: () => this.name.toUpperCase() });
    this.log.warn(`Launching ${this.name.toUpperCase()} scraper`);
    // check the config file to set the timeouts.
    // @ts-ignore
    this.timeout = this.config?.additionalParams?.simplyHired?.timeout || 500;
    this.log.debug(`Timeout: ${this.timeout}`);
  }

  async login() {
    super.login();
    this.log.debug(`Going to ${this.url}`);
    await this.page.goto(this.url);
  }

  async generateListings() {
    super.generateListings();
    await this.page.waitForSelector('input[name=q]');
    await this.page.$eval('input[name=l]', (el) => {
      // eslint-disable-next-line no-param-reassign
      el.value = '';
    }, {});
    // TODO this should be in the config or other file for other instances.
    await this.page.type('input[name=q]', 'computer science intern');
    await this.page.click('button[type="submit"]');
    this.log.info('Inputted search query: computer science intern');
    await this.page.waitForSelector('div[data-id=JobType]');
    // Getting href link for internship filter
    const internshipDropdown = await this.page.$$eval('a[href*="internship"]', (nodes) => nodes.map(node => node.getAttribute('href')));
    if (internshipDropdown.length > 0) {
      const url = `${this.url}${internshipDropdown[0]}`;
      // this.log.info(`Directing to: ${url}`);
      await this.page.goto(url);
      await this.page.waitForSelector('div[data-id=JobType]');
      // Setting filter as last '30 days'
      const lastPosted = await this.page.$$eval('div[data-id=Date] a[href*="30"]', (nodes) => nodes.map(node => node.getAttribute('href')));
      const lastPostedURL = `${this.url}${lastPosted[0]}`;
      this.log.info('Setting Date Relevance: 30 days');
      this.log.info(`Directing to: ${lastPostedURL}`);
      await this.page.goto(lastPostedURL);
      await this.page.waitForTimeout(this.timeout);
      await this.page.click('a[class=SortToggle]');
      await this.page.waitForNavigation();
      // Filtering by most recent
      this.log.info('Filtering by: Most recent');
      let totalPages = 0;
      let internshipsPerPage = 0;
      let hasNext = true;
      do {
        await this.page.waitForSelector('.SerpJob-jobCard.card');
        const elements = await this.page.$$('.SerpJob-jobCard.card');
        this.log.debug('Results on page: ', elements.length);
        this.log.debug('--- Trying to scrape with old UI layout ---');
        // await this.page.waitForTimeout(1000);
        const urls = await this.page.$$eval('a[class="SerpJob-link card-link"]', (nodes) => nodes.map(node => node.href));
        // this.log.debug(`URLS: \n${urls}`);
        for (let i = 1; i <= elements.length; i++) {
          await this.page.waitForTimeout(this.timeout);
          const element = elements[i];
          const positionVal = await this.getValues('div[class="viewjob-jobTitle h2"]', 'innerText');
          let position;
          if (positionVal.length > 0) {
            position = positionVal[0].trim();
          }
          const companyVal = await this.getValues('div[class="viewjob-header-companyInfo"] div:nth-child(1)', 'innerText');
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
            this.log.debug('No company found');
          }
          const locationObj = await this.getValues('div[class="viewjob-header-companyInfo"] div:nth-child(2)', 'innerText');
          if (locationObj.length > 1) {
            this.log.debug(`Multiple locations for ${company}: ${position}`);
          }
          const locationStr = `${locationObj}`;
          const description = await this.getValues('div[class="viewjob-jobDescription"]', 'innerHTML');
          const postedVal = await this.getValues('span[class="viewjob-labelWithIcon viewjob-age"]', 'innerText');
          let posted = '';
          if (postedVal.length > 0) {
            posted = convertPostedToDate(postedVal[0].toLowerCase()).toLocaleDateString();
          } else {
            posted = 'N/A';
            this.log.debug('No date found. Setting posted as: N/A');
          }
          this.log.debug(`Position: ${position}`);
          this.log.debug(`Company: ${company}`);
          this.log.debug(`Posted: ${posted}`);
          // this.log.debug(`LocationStr: ${locationStr} ${typeof locationStr}`);
          // this.log.debug(`Description: ${description}`);
          const url = urls[i - 1];
          const lSplit = locationStr.split(', ');
          // this.log.debug(`${lSplit.length}`);
          const city = (lSplit.length > 0) ? lSplit[0] : '';
          const state = (lSplit.length > 1) ? lSplit[1] : '';
          const country = '';
          this.log.debug(`Location: {${city}, ${state}, ${country}}`);
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
            await element.click();
          }
        }
        const nextPage = await this.page.$('a[class="Pagination-link next-pagination"]');
        if (!nextPage) {
          hasNext = false;
          this.log.info('Reached the end of pages!');
        } else {
          await nextPage.click();
          totalPages++;
          this.log.info(`Processed page ${totalPages}, ${internshipsPerPage} internships`);
        }
      } while (hasNext === true);
      this.log.debug(`Found ${totalPages} pages.`);
    } else {
      this.log.debug('There are no internships with the search query: \'computer science intern\'');
    }
  }

  async processListings() {
    await super.processListings();
    // No post-processing (yet) for Simply Hired scraper results.
  }

}
