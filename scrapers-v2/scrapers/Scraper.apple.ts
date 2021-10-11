import { Scraper } from './Scraper';
import { fetchInfo } from '../../scraper/scrapers/scraper-functions';

const prefix = require('loglevel-plugin-prefix');

export class AppleScraper extends Scraper {
  constructor() {
    super({ name: 'apple', url: 'https://jobs.apple.com/en-us/search?sort=relevance' });
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

  async getData(page) {
    const results = [];
    for (let i = 0; i < 4; i++) {
      // Get position, date, state, and city:
      results.push(fetchInfo(page, 'h1[itemprop="title"]', 'innerText'));
      results.push(fetchInfo(page, 'time[id="jobPostDate"]', 'innerText'));
      results.push(fetchInfo(page, 'div[id="jd-description"]', 'innerHTML'));
      results.push(fetchInfo(page, 'span[itemprop="addressLocality"]', 'innerText'));
      results.push(fetchInfo(page, 'span[itemprop="addressRegion"]', 'innerText'));
    }
    return Promise.all(results);
  }

  async setSearchFilter(page) {
    await this.page.waitForSelector('input[id="searchview"]');
    await this.page.type('input[id="searchview"]', 'internship');
    await this.page.keyboard.press('Enter');
    await this.page.waitForSelector('button[id="locations-filter-acc"]');
    await this.page.click('button[id="locations-filter-acc"]');
    await this.page.waitForSelector('input[id="locations-filter-input"]');
    await this.page.click('input[id="locations-filter-input"]');
    // Separated 'United' and 'States' so that dropdown list comes out
    await this.page.type('input[id="locations-filter-input"]', 'United');
    await this.page.type('input[id="locations-filter-input"]', ' States');
    // Delay prevents code from bypassing page changes
    await delay(5000);
    await this.page.waitForSelector('li[id="locations-filter-input-option-0"]');
    await this.page.click('li[id="locations-filter-input-option-0"]');
    await delay(5000);
  }

  async generateListings() {
    const data = [];
    super.generateListings();
    await this.page.goto('https://jobs.apple.com/en-us/search?sort=relevance');

    //setSearchFilter 
    await setSearchFilter(this.page);

    //Gets the total pages
    let totalPage = await this.page.evaluate(() => document.querySelector('form[id="frmPagination"] span:last-child').innerHTML);
    // if there is just 1 page, set totalPage to 3 because for loop below starts at 2
    if (totalPage === undefined || totalPage === 1) {
      totalPage = 3;
    }

    // for loop allows for multiple iterations of pages -- start at 2 because initial landing is page 1
    for (let i = 2; i <= totalPage; i++) {
      await this.page.waitForSelector('a[class="table--advanced-search__title"]');
      const vals = [];
      const nodes = document.querySelectorAll('a[class="table--advanced-search__title"]');
      nodes.forEach(node => vals.push(node['href']));

      for (let j = 0; j < nodes.length; j++) {
        await this.page.goto(nodes[j]);
        const lastScraped = new Date();
        const [position, posted, description, city, state] = await this.getData(this.page);
        const date = new Date(posted).toISOString();
        data.push({
          url: nodes[j],
          position: position,
          posted: date,
          lastScraped: lastScraped,
          location: { city: city, state: state },
          description: description,
        });

      }
      // Uses i value in for loop to navigate search pages
      await this.page.goto(`https://jobs.apple.com/en-us/search?search=internship&sort=relevance&location=united-states-USA&page=${i}`);
    }

  }

}

export default AppleScraper;