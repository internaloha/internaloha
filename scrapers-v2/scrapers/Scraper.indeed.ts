import { Listing } from './Listing';
import { Scraper } from './Scraper';


const prefix = require('loglevel-plugin-prefix');

export class IndeedScrapper extends Scraper {
  constructor() {
    super({ name: 'indeed', url: 'https://www.indeed.com' });
  }

  async launch() {
    await super.launch();
    prefix.apply(this.log, { nameFormatter: () => this.name.toUpperCase() });
    this.log.warn(`Launching ${this.name.toUpperCase()} scraper`);
  }

  async login() {
    await super.login();
    await this.page.goto(this.url);
  }

  async dateCalculator(posted) {
    const date = new Date();
    date.setDate(date.getDate() - posted);
    return date;
  }

  async setUpSearchCriteria() {
    // type in the word Computer Science in the "What" box
    await this.page.waitForSelector('input[id="text-input-what"]');
    await this.page.waitForSelector('button[class="icl-Button icl-Button--primary icl-Button--md icl-WhatWhere-button"]');
    await this.page.type('input[id="text-input-what"]', 'computer science intern');
    this.log.info('Searching based on "Computer Science');
    await this.page.waitForTimeout(2000);
    // set up the United States search field
    await this.page.waitForSelector('input[id="text-input-where"]');
    await this.page.click('input[id="text-input-where"]', { clickCount: 3 });
    await this.page.type('input[id="text-input-where"]', 'United States');
    await this.page.click('button[class="icl-Button icl-Button--primary icl-Button--md icl-WhatWhere-button"]');
    this.log.info('Setting up location by United States');
    // set up the Last 14 day criteria
    await this.page.waitForSelector('button[aria-controls="filter-dateposted-menu"]');
    await this.page.click('button[aria-controls="filter-dateposted-menu"]');
    await this.page.waitForTimeout(1000);
    await this.page.click('#filter-dateposted-menu > li:nth-child(4)');
    this.log.info('Filtering based on "Last 14 Days"');
    // set up the internship criteria
    await this.page.waitForSelector('button[aria-controls="filter-jobtype-menu"]');
    await this.page.waitForTimeout(1000);
    await this.page.click('button[aria-controls="filter-jobtype-menu"]');
    await this.page.click('#filter-jobtype-menu > li:nth-child(1)');
    this.log.info('Filtering based on "Internships"');
  }

  async procressPage(pageNum) {
    let internshipPerPage = 0;
    await this.page.waitForSelector('div[class="jobsearch-SerpJobCard unifiedRow row result clickcard"] h2.title a');

    let urls = await super.getValues('a[class="jobsearch-SerpJobCard unifiedRow row result clickcard"]', 'href');
    this.log.info(`Processing page ${pageNum+1} with ${urls.length} listings.`);

    // Retrieve the locations
    const locations = await super.getValues('div[class="companyLocation"', 'innerText');
    this.log.debug(`Locations: \n${locations}`);

    //break the cities and states of the locations
    const cities = [];
    const states = [];
    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i].split(', ');
      cities.push(loc[0]);
      states.push(loc[1]);
    }

    // Retrieve each URL, extract the internship listing info.
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      await this.page.goto(url);
      const position = await super.getValues('div[class="jobsearch-JobInfoHeader-title-container"]', 'innerHTML');
      this.log.debug(`Position: \n${position}`);
      const company = await super.getValues('div[class="icl-u-lg-mr--sm icl-u-xs-mr--xs"]', 'innerText');
      this.log.debug(`Company:\\n${company}`);
      const description = await super.getValues('div[id="jobDescriptionText"]', 'innerText');
      this.log.debug(`Description:\\n${description}`);
      const location = { city: cities[i], state: states[i], country: 'United States' };
      const listing = new Listing({ url, location, position, description, company });
      this.listings.addListing(listing);
      internshipPerPage++;
    }
    return internshipPerPage;
  }

  async generateListings() {
    await super.generateListings();
    await this.setUpSearchCriteria();
    let totalPages = 0;
    let totalInternships = 0;
    let hasNext = true;
    while (hasNext) {
      totalInternships = await this.procressPage(totalPages);
      const nextPage = await this.page.$('li a[aria-label="Next"]');
      if (!nextPage) {
        hasNext = false;
      } else {
        await nextPage.click();
      }
      totalPages++;
    }
    this.log.debug(`Processed Page Counts: ${totalPages} \n Processed Internship Count: ${totalInternships}`);
  }

  async processListings() {
    await super.processListings();
  }
}
