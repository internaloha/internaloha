import { Listing } from './Listing';
import { Scraper } from './Scraper';
import _ from 'underscore';

const prefix = require('loglevel-plugin-prefix');

export class ZipRecruiterScraper extends Scraper {
  constructor() {
    super({ name: 'ziprecruiter', url: 'https://www.ziprecruiter.com/candidate/search?search=computer+science+internship&location=United+States&days=30&radius=25' });
  }

  /**
   * Scrolls down a specific amount every 4 milliseconds.
   * @param page The page we are scrolling.
   * @returns {Promise<void>}
   */
  public async autoScroll() {
    await this.page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 400;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve(); //????
          }
        }, 400);
      });
    });
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
    await this.page.goto('https://www.ziprecruiter.com/candidate/search?search=computer+science+internship&location=United+States&days=30&radius=25');
    await this.page.waitForNavigation;

    let loadMore = true;
    if (!loadMore) {
      this.log.info('--- All jobs are Listed, no "Load More" button --- ');
    } else {
      await this.page.click('.load_more_jobs');
      await this.autoScroll();
    }

    let urls = await this.page.evaluate(
      () => Array.from(
        document.querySelectorAll('.job_link.t_job_link'),
        a => a.getAttribute('href'),
      ),
    );
    
    urls = _.uniq(urls);
    this.log.info(`Found ${urls.length} listings`);

    // Positions
    const positions = await super.getValues('h1[class="job_title"]', 'innerText');
    this.log.debug(`Positions: \n${positions}`);
    // Description
    const descriptions = await super.getValues('div[class="job_description_container"] ', 'innerText');
    this.log.debug(`Descriptions: \n${descriptions}`);

    //Companies
    const companies = await super.getValues('a[class="t_org_link name"]', 'innerText');
    this.log.debug(`Companies: \n${companies}`);

    // Locations
    const locations = await super.getValues('a[class="t_location_link location"]', 'innerText');
    this.log.debug(`Locations: \n${locations}`);
    //break the cities and states of the locations
    const cities = [];
    const states = [];
    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i].split(', ');
      cities.push(loc[0]);
      states.push(loc[1]);
    }
    for (let i = 0; i < urls.length; i++) {
      const location = { city: cities[i], state: states[i], country: 'United States' };
      const listing = new Listing({ url: urls[i], position: positions[i], location, company: companies[i], description: descriptions[i] });
      this.listings.addListing(listing);
    }
  }

  async processListings() {
    await super.processListings();
  }
}
