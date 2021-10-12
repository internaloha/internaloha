// import { Listing } from './Listing';
import { Scraper } from './Scraper';
import Logger from 'loglevel';
import { Listing } from './Listing';

const prefix = require('loglevel-plugin-prefix');

export class SimplyHiredScraper extends Scraper {
  constructor() {
    super({ name: 'simplyHired', url: 'https://www.simplyhired.com/' });
  }

  /**
   * Get the values associated with the passed selector and associated field.
   * Because we can't do closures with puppeteer, special arguments are needed to pass selector and field into page.evaluate().
   * See: https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pageevaluatepagefunction-args
   * Also: we have to create a returnVals variable and await it, then return it.
   * It's worth it because we call this function five times in generateListings.
   */
  private async getValues(selector, field) {
    const returnVals = await this.page.evaluate((selector, field) => {
      const vals = [];
      const nodes = document.querySelectorAll(selector);
      nodes.forEach(node => vals.push(node[field]));
      return vals;
    }, selector, field);
    return returnVals;
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
    await this.page.goto('https://www.simplyhired.com/');
    await this.page.waitForSelector('input[name=q]');
    await this.page.$eval('input[name=l]', (el) => {
      // eslint-disable-next-line no-param-reassign
      el.value = '';
    }, {});
    await this.page.type('input[name=q]', 'computer science intern');
    await this.page.click('button[type="submit"]');
    this.log.info('Inputted search query: computer science intern');
    await this.page.waitForSelector('div[data-id=JobType]');
    // Getting href link for internship filter
    const internshipDropdown = await this.page.evaluate(
      () => Array.from(
        document.querySelectorAll('a[href*="internship"]'),
        a => a.getAttribute('href'),
      ),
    );

    if (internshipDropdown.length > 0) {
      const url = `https://www.simplyhired.com/${internshipDropdown[0]}`;
      this.log.info(`Directing to: ${url}`);
      await this.page.goto(url);
      await this.page.waitForSelector('div[data-id=JobType]');
      // Setting filter as last '30 days'
      const lastPosted = await this.page.evaluate(
        () => Array.from(
          document.querySelectorAll('div[data-id=Date] a[href*="30"]'),
          a => a.getAttribute('href'),
        ),
      );
      const lastPostedURL = `https://www.simplyhired.com/${lastPosted[0]}`;
      this.log.info('Setting Date Relevance: 30 days');
      await this.page.goto(lastPostedURL);
      await this.page.waitForTimeout(1000);
      await this.page.click('a[class=SortToggle]');
      this.log.info('Filtering by: Most recent');
      let hasNext = true;
      while (hasNext === true) {
        try {
          await this.page.waitForSelector('.SerpJob-jobCard.card');
          const elements = await this.page.$$('.SerpJob-jobCard.card');
          this.log.info('\n\nTotal results: ', elements.length);
          try {
            // Test to see which UI loads
            await this.page.evaluate(() => document.querySelector('.rpContent.ViewJob.ViewJob-redesign.ViewJob-v3').innerHTML);
            Logger.info('Loaded up with new UI... \n');
            await this.page.waitForSelector('.RightPane');
            await this.page.waitForSelector('h2.viewjob-jobTitle');
            await this.page.waitForSelector('.viewjob-labelWithIcon');
            // eslint-disable-next-line no-shadow
            // await getData(this.page, elements).then((data => {
            //   this.log.info(data);
            // }));

          } catch (e) {
            this.log.debug('--- Loaded up old UI. Trying to scrape with old UI layout ---');
            try {
              await this.page.waitForTimeout(1000);
              const urls = await this.page.evaluate(
                () => Array.from(
                  // eslint-disable-next-line no-undef
                  document.querySelectorAll('a[class="SerpJob-link card-link"]'),
                  // @ts-ignore
                  a => a.href,
                ),
              );
              this.log.debug(`URLS: \n${urls}`);

              for (let i = 1; i <= elements.length; i++) {
                const element = elements[i];
                const position = await this.getValues('div[class="viewjob-jobTitle h2"]', 'innerText');
                const company = await this.getValues('div[class="viewjob-header-companyInfo"] div:nth-child(1)', 'innerText');
                const location = await this.getValues('div[class="viewjob-header-companyInfo"] div:nth-child(2)', 'innerText');
                const description = await this.getValues('div[class="viewjob-jobDescription"]', 'innerHTML');
                this.log.debug(`Position: \n${position}`);
                this.log.debug(`Company: \n${company}`);
                this.log.debug(`Location: \n${location}`);
                this.log.debug(`Description: \n${description}`);
                const listing = new Listing({
                  url: urls[i - 1], location: {
                    city: location.match(/^([^,]*)/)[0],
                    state: location.match(/([^ ,]*)$/)[0],
                    country: '',
                  },
                  position, description, company});
                this.listings.addListing(listing);
                if (i < elements.length) {
                  await element.click();
                }
              }
            } catch (err) {
              this.log.trace(this.name, 'Error: ', err);
            }
          }
          const nextPage = await this.page.$('a[class="Pagination-link next-pagination"]');
          await nextPage.click();

        } catch (err5) {
          hasNext = false;
          this.log.info('\nReached the end of pages!');
        }
      }
    } else {
      this.log.debug('There are no internships with the search query: \'computer science intern\'');
    }
  }

  async processListings() {
    await super.processListings();
    // No post-processing (yet) for Simply Hired scraper results.
  }

}
