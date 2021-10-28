import { Scraper } from './Scraper';

const prefix = require('loglevel-plugin-prefix');

export class IndeedScrapper extends Scraper {
  constructor() {
    super({ name: 'indeed', url: 'https://www.indeed.com/jobs?q=computer%20science%20intern&jt=internship&sort=date&fromage=14&vjk=07a16fd583142467' });
  }

  async launch() {
    await super.launch();
    prefix.apply(this.log, { nameFormatter: () => this.name.toUpperCase() });
    this.log.warn(`Launching ${this.name.toUpperCase()} scraper`);
  }

  async login() {
    await super.login();
    // if you need to login, put that code here.
    await this.page.goto(this.url);
  }

  async generateListings() {
    await super.generateListings();
    // variable to store the page count of the URL; for indeed the page count increments by 10
    let pageNum = 0;

    const listingsTable = '#tblResultSet';

    // pageUrl returns an URL containing the specified page number.
    const pageUrl = (pageNum) =>
      `https://www.indeed.com/jobs?q=computer%20science%20intern&jt=internship&sort=date&fromage=14&start=${pageNum}&vjk=dbc0c52cd8cc4e91`;

    //go to the first page of job listings for Indeed
    await this.page.goto(pageUrl(pageNum), { waitUntil: 'networkidle0' });

    while (await super.selectorExists(listingsTable)) {
      // collect the URLs of the list of jobs
      let urls = await super.getValues('a[class="icl-Button icl-Button--primary icl-Button--lg icl-Button--block"]', 'href');
      this.log.info(`Processing page ${pageNum} with ${urls.length} listings.`);


    }




  }

  async processListings() {
    await super.processListings();
  }
}
