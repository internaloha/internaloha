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

  async generateListings() {
    await super.generateListings();
    await this.setUpSearchCriteria();
    // variable to store the page count of the URL; for indeed the page count increments by 10
    let pageNum = 0;

    const listingsTable = '#mosaic-zone-jobcards';

    // pageUrl returns an URL containing the specified page number.
    const pageUrl = (pageNum) =>
      `https://www.indeed.com/jobs?q=computer%20science%20intern&jt=internship&sort=date&fromage=14&start=${pageNum}&vjk=dbc0c52cd8cc4e91`;

    //go to the first page of job listings for Indeed
    await this.page.goto(pageUrl(pageNum), { waitUntil: 'networkidle0' });

    // while there is still display of tables on the Indeed Page
    while (await super.selectorExists(listingsTable)) {
      // collect the URLs of the list of jobs
      let urls = await super.getValues('a[class="jobsearch-SerpJobCard unifiedRow row result clickcard"]', 'href');
      this.log.info(`Processing page ${pageNum} with ${urls.length} listings.`);

      // Retrieve the Positions
      const positions = await super.getValues('div[class="heading4 color-text-primary singleLineTitle tapItem-gutter"]', 'innerText');
      this.log.debug(`Positions: \n${positions}`);

      // Retrieve the descriptions
      const descriptions = await super.getValues('div[class="job-snippet"]', 'innerText');
      this.log.debug(`Descriptions: \n${descriptions}`);

      // Retrieve the companies
      const companies = await super.getValues('span[class="companyName"', 'innerText');
      this.log.debug(`Companies: \n${companies}`);

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
        const location = { city: cities[i], state: states[i], country: 'United States' };
        const listing = new Listing({ url: urls[i], position: positions[i], location, company: companies[i], description: descriptions[i] });
        this.listings.addListing(listing);
      }

      // increment the pageNum by 10
      pageNum = pageNum + 10;
      // Increment the pageNum and get that page. If we get a page without listings, then listingsTable selector won't be on it.
      await this.page.goto(pageUrl(pageNum), { waitUntil: 'networkidle0' });
    }
  }

  async processListings() {
    await super.processListings();
  }
}
