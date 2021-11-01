import { Listing } from './Listing';
import { Scraper } from './Scraper';


const prefix = require('loglevel-plugin-prefix');

export class IndeedScrapper extends Scraper {
  constructor() {
    super({ name: 'indeed', url: 'https://www.indeed.com/jobs?q=computer%20science%20intern&jt=internship&sort=date&fromage=14&start=0&vjk=dbc0c52cd8cc4e91' });
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

  async generateListings() {
    await super.generateListings();
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
