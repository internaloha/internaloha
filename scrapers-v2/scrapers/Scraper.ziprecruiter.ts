import { Scraper } from './Scraper';
import { fetchInfo } from './scraper-functions.js';
const prefix = require('loglevel-plugin-prefix');

async function getData(page) {
  const results = [];
  for (let i = 0; i < 5; i++) {
    results.push(fetchInfo(page, '.job_title', 'innerText'));
    results.push(fetchInfo(page, '.hiring_company_text.t_company_name', 'innerText'));
    results.push(fetchInfo(page, 'span[data-name="address"]', 'innerText'));
    results.push(fetchInfo(page, '.jobDescriptionSection', 'innerHTML'));
    results.push(fetchInfo(page, '.job_more span[class="data"]', 'innerText'));
  }
  return Promise.all(results);
}

export class ZipRecruiterScraper extends Scraper {
  constructor() {
    super({ name: 'Zip:', url: 'https://www.ziprecruiter.com/' });
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
    const data = [];
    await this.page.goto('https://www.ziprecruiter.com/');
    await this.page.waitForSelector('input[id="search1"]');
    await this.page.waitForSelector('input[id="location1"]');
    const searchQuery = 'computer science internship';
    this.log.debug('Inputting search query:', searchQuery);
    await this.page.type('input[id="search1"', searchQuery);
    await this.page.$eval('input[id="location1"]', (el) => el.value = 'US');
    await this.page.click('button.job_search_hide + input');
    await this.page.mouse.click(1, 1);
    await this.page.waitForSelector('.modal-dialog');
    await this.page.mouse.click(1000, 800);
    await this.page.waitForTimeout(5000);
    this.log.debug('Setting filter by 10 days...');
    await this.page.click('menu[id="select-menu-search_filters_tags"] > button[class="select-menu-header"]');
    await this.page.click('menu[id="select-menu-search_filters_tags"] .select-menu-item:nth-child(3)');
    await this.page.waitForTimeout(5000);
    await this.page.waitForSelector('.job_content');
    try {
      // Click the "Load More" button
      await this.page.click('.load_more_jobs');
    } catch (err) {
      this.log.debug('--- All jobs are Listed, no "Load More" button --- ');
    }

    // Generate a set of parallel arrays containing the fields to be put into each listing.
    // Each array should be the same length, and each positional element should refer to the same listing.
    // Start by creating an array of URLs.
    let elements = await this.page.evaluate(
      () => Array.from(
        // eslint-disable-next-line no-undef
        document.querySelectorAll('.job_link.t_job_link'),
        a => a.getAttribute('href'),
      ),
    );
    this.log.debug(elements.length);
    for (let i = 0; i < elements; i++) {
      const element = elements[i];
      await this.page.goto(element, { waitUntil: 'domcontentloaded' });
      const currentPage = this.page.url();
      if (currentPage.startsWith('https://www.ziprecruiter.com')) {
        await this.page.waitForSelector('.pc_message');
        await this.page.click('.pc_message');
        const date = new Date();
        let daysBack = 0;
        const lastScraped = new Date();
        const [position, company, location, description, posted] = await getData(this.page);
        if (posted.includes('yesterday')) {
          daysBack = 1;
      } else {
          daysBack = posted.match(/\d+/g);
        }
        date.setDate(date.getDate() - daysBack);
        data.push({
          position: position.trim(),
          company: company.trim(),
          location: {
            city: location.match(/([^,]*)/g)[0].trim(),
            state: location.match(/([^,]*)/g)[2].trim(),
            country: location.match(/([^,]*)/g)[4].trim(),
          },
          url: currentPage,
          posted: date,
          lastScraped: lastScraped,
          description: description.trim(),
        });
    }
    this.log.debug(`URLS: \n${urls}`);

    //generate the arrays
    for (let i = 0; i < urls.length; i++) {

    }
  }
}
