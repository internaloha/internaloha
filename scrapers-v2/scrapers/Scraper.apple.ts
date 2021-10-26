import { Listing } from './Listing';
import { Scraper } from './Scraper';

const prefix = require('loglevel-plugin-prefix');

export class Apple extends Scraper {
  constructor() {
    super({ name: 'apple', url: 'https://jobs.apple.com/en-us/search?sort=relevance' });
  }

  async launch() {
    await super.launch();
    prefix.apply(this.log, { nameFormatter: () => this.name.toUpperCase() });
    this.log.warn(`Launching ${this.name.toUpperCase()} scraper`);
  }

  async login() {
    super.login();
    await this.page.goto(this.url);
  }

  async generateListings() {
    await super.generateListings();
    let pageNum = 1;
    const listingsTable= '#tblResultSet';

    //Create an function called pageUrl which puts the pageNum into the URL
    const pageUrl = (pageNum) =>
      `https://jobs.apple.com/en-us/search?location=united-states-USA&sort=relevance&search=internship&page=${pageNum}`;

    //We navigate to the first page
    await this.page.goto('https://jobs.apple.com/en-us/search?location=united-states-USA&sort=relevance&search' +
      '=internship&page=1');
    await this.page.waitForTimeout(1000); //Delay helps to stop websites from blocking pupetteer

    while (await super.selectorExists(listingsTable)) {

      //We get the number of urls on the current page (this changes depending on the page we are on)
      let urls = await super.getValues('a[class="table--advanced-search__title"]', 'href');

      //This for loop evaluates each url on the page
      for (let i = 0; i < urls.length; i++) {

        await this.page.goto(urls[i]);

        const positions = await super.getValues('h1[itemprop="title"]', 'innerText');
        const descriptions = await super.getValues('div[id="jd-description"]', 'innerText');
        const states = await super.getValues('span[itemprop="addressRegion"]', 'innerText');
        const cities = await super.getValues('span[itemprop="addressLocality"]', 'innerText');
        const location = { city: cities[0], state: states[0], country: 'United States' };

        const listing = new Listing({
          url: urls[i], position: positions[0], location, company: 'Apple', description:
            descriptions[0]
        });
        this.listings.addListing(listing);

      }

      // Go to the next page.
      await this.page.goto(pageUrl(++pageNum), {waitUntil: 'networkidle2'});
      // this is supposed to help with website naviagtion by considering navigation to be finished if there are 2 network
      // connections for at least 500
    }
  }

  async processListings() {
    await super.processListings();
  }

}
