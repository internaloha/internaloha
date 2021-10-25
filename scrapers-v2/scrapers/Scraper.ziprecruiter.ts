import { Scraper } from './Scraper';
const prefix = require('loglevel-plugin-prefix');
/**
 * Fetches the information from the page.
 * @param page The page we are scraping
 * @param selector The CSS Selector
 * @param DOM_Element The DOM element we want to use. Common ones are innerHTML, innerText, textContent
 * @returns {Promise<*>} The information as a String.
 */

export class ZipRecruiterScraper extends Scraper {
  constructor() {
    super({ name: 'ziprecruiter', url: 'https://www.ziprecruiter.com/candidate/search?search=computer+science+internship&location=United+States&days=30&radius=25' });
  }

  /**
   * Scrolls down a specific amount every 4 milliseconds.
   * @param page The page we are scrolling.
   * @returns {Promise<void>}
   */
  async getData(page) {
    const results = [];
    results.push(super.getValues(page, '.job_title'));
    results.push(super.getValues(page, '.hiring_company_text.t_company_name'));
    results.push(super.getValues(page, 'span[data-name="address"]'));
    results.push(super.getValues(page, '.jobDescriptionSection'));
    results.push(super.getValues(page, '.job_more span[class="data"]'));

  }
  async autoScroll() {
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

  async reload() {
    await this.page.goto('https://www.ziprecruiter.com/candidate/search?search=computer+science+internship&location=United+States&days=30&radius=25');
    await this.page.waitForSelector('.job_content');
    this.log.info('Fetching jobs...');
    await this.autoScroll();
    await this.page.waitForTimeout(5000);
    await this.autoScroll();
    let loadMore = true;
    let loadCount = 0;
    // Sometimes infinite scroll stops and switches to a "load more" button
    while (loadMore === true && loadCount <= 40) {
      try {
        await this.page.waitForTimeout(5000);
        if (await this.page.waitForSelector('button[data-tracking-control-name="infinite-scroller_show-more"]')) {
          await this.page.click('.load_more_jobs');
        } else {
          await this.autoScroll();
        }
        loadCount++;
      } catch (e2) {
        loadMore = false;
        this.log.debug('Finished loading...');
      }
    }
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
    await this.reload();
    // grab all links
    const elements = await this.page.evaluate(
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
      await this.page.waitForSelector('.pc_message');
      await this.page.click('.pc_message');
      const date = new Date();
      let daysBack = 0;
      const lastScraped = new Date();
      const [position, company, location, description, posted] = await this.getData(this.page);
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
        url: 'https://www.ziprecruiter.com/candidate/search?search=computer+science+internship&location=United+States&days=30&radius=25',
        posted: date,
        lastScraped: lastScraped,
        description: description.trim(),
      });
    }
  }

  async processListings() {
    await super.processListings();
    // No post-processing (yet) for NSF scraper results.
  }
}
