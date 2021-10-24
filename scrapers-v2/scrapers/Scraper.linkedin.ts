import { Scraper } from './Scraper';

const prefix = require('loglevel-plugin-prefix');

export class LinkedinScraper extends Scraper {
  constructor() {
    super({ name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search?keywords=Computer%2BScience&location=United%2BStates&geoId=103644278&trk=public_jobs_jobs-search-bar_search-submit&f_TP=1%2C2%2C3%2C4&f_E=1&f_JT=I&redirect=false&position=1&pageNum=0' });
  }

  async launch() {
    await super.launch();
    prefix.apply(this.log, { nameFormatter: () => this.name.toUpperCase() });
    this.log.info('Launching scraper.');
  }

  async login() {
    super.login();
  }

  /**
   * Scrolls down a specific amount every 4 milliseconds.
   * @param page The page we are scrolling.
   * @returns {Promise<void>}
   */
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
    await this.page.goto(this.url);
    await this.page.waitForSelector('a[class="base-card__full-link"]');
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
          await this.page.click('button[data-tracking-control-name="infinite-scroller_show-more"]');
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

  async convertPostedToDate(posted) {
    const date = new Date();
    let daysBack = 0;
    if (posted.includes('hours') || (posted.includes('hour')) || (posted.includes('minute'))
      || (posted.includes('minutes')) || (posted.includes('moment')) || (posted.includes('second'))
      || (posted.includes('seconds')) || (posted.includes('today'))) {
      daysBack = 0;
    } else if ((posted.includes('week')) || (posted.includes('weeks'))) {
      daysBack = posted.match(/\d+/g) * 7;
    } else if ((posted.includes('month')) || (posted.includes('months'))) {
      daysBack = posted.match(/\d+/g) * 30;
    } else {
      daysBack = posted.match(/\d+/g);
    }
    date.setDate(date.getDate() - daysBack);
    return date;
  }

  async generateListings() {
    await super.generateListings();
    await this.reload();
    let totalInternships = 0;
    let elements = await this.page.$$('a[class="base-card__full-link"]');
    this.log.info('Total Elements:', elements);
    // let urls = await this.page.evaluate(() => {
    //   const vals = [];
    //   const nodes = document.querySelectorAll('a[class="base-card__full-link"]');
    //   nodes.forEach(node => vals.push(node['href']));
    //   return vals;
    // });
    let urls = await super.getValues('a[class="base-card__full-link"]', 'href');

    this.log.info('Total URLs:', urls.length);
    const skippedURLs = [];
    const lastScraped = new Date();

    for (let i = 0; i < elements.length; i++) {
      try {
        const element = elements[i];
        // sometimes clicking it doesn't show the panel, try/catch to allow it to keep going
        try {
          await this.page.waitForSelector('div[class="details-pane__content details-pane__content--show"]', { timeout: 1500 });
          await this.page.waitForTimeout(1500);
          // eslint-disable-next-line prefer-const
          // const position = await this.page.evaluate(() => {
          //   const vals = [];
          //   const nodes = document.querySelectorAll('h1[class="topcard__title"]');
          //   nodes.forEach(node => vals.push(node['innerText']));
          //   return vals;
          // });
          const position = await super.getValues('h1[class="topcard__title"]', 'innerText');
          // const company = await this.page.evaluate(() => {
          //   const vals = [];
          //   const nodes = document.querySelectorAll('a[class="topcard__org-name-link topcard__flavor--black-link"]');
          //   nodes.forEach(node => vals.push(node['innerText']));
          //   return vals;
          // });
          const company = await super.getValues('a[class="topcard__org-name-link topcard__flavor--black-link"]', 'innerText');
          // const location = await this.page.evaluate(() => {
          //   const vals = [];
          //   const nodes = document.querySelectorAll('span[class="topcard__flavor topcard__flavor--bullet"]');
          //   nodes.forEach(node => vals.push(node['innerText']));
          //   return vals;
          // });
          const location = await super.getValues('span[class="topcard__flavor topcard__flavor--bullet"]', 'innerText');
          // let posted = await this.page.evaluate(() => {
          //   const vals = [];
          //   const nodes = document.querySelectorAll('span.topcard__flavor--metadata.posted-time-ago__text');
          //   nodes.forEach(node => vals.push(node['innerText']));
          //   return vals;
          // });
          let posted = await super.getValues('span.topcard__flavor--metadata.posted-time-ago__text', 'innerText');
          // const description = await this.page.evaluate(() => {
          //   const vals = [];
          //   const nodes = document.querySelectorAll('div[class="show-more-less-html__markup show-more-less-html__markup--clamp-after-5"]');
          //   nodes.forEach(node => vals.push(node['innerText']));
          //   return vals;
          // });
          const description = await super.getValues('div[class="show-more-less-html__markup show-more-less-html__markup--clamp-after-5"]', 'innerText');
          posted = this.convertPostedToDate(posted);
          let state = '';
          if (!location.match(/([^,]*)/g)[2]) {
            state = 'United States';
          } else {
            state = location.match(/([^,]*)/g)[2].trim();
          }
          this.listings.addListing({
            position: position,
            company: company,
            location: {
              city: location.match(/([^,]*)/g)[0],
              state: state,
            },
            posted: posted,
            url: urls[i],
            lastScraped: lastScraped,
            description: description,
          });
          this.log.info(position);
          totalInternships++;
        } catch (err5) {
          // this.log.info('LinkedIn', err5.message);
          this.log.info('Skipping! Did not load...');
          skippedURLs.push(urls[i]);
        }
        await element.click();
      } catch (e2) {
        this.log.info('Navigated off site... Redirecting back...');
        await this.reload();
        elements = await this.page.$$('li[class="result-card job-result-card result-card--with-hover-state"]');
        // times = await this.page.evaluate(
        //     () => Array.from(
        //         // eslint-disable-next-line no-undef
        //         document.querySelectorAll('div.result-card__meta.job-result-card__meta time:last-child'),
        //         a => a.textContent,
        //     ),
        // );
        urls = await this.page.evaluate(() => {
          const vals = [];
          const nodes = document.querySelectorAll('a.result-card__full-card-link');
          nodes.forEach(node => vals.push(node['href']));
          return vals;
        });
      }
      await elements[i + 1].click();
    }

    this.log.info('--- Going back to scrape the ones previously skipped ---');
    // scraping the ones we skipped
    for (let i = 0; i < skippedURLs.length; i++) {
      await this.page.goto(skippedURLs[i]);
      await this.page.waitForSelector('section.core-rail');
      const skills = 'N/A';
      // eslint-disable-next-line prefer-const
      const position = await super.getValues('h1[class="topcard__title"]', 'innerText');

      const company = await super.getValues('a[class="topcard__org-name-link topcard__flavor--black-link"]', 'innerText');

      const location = await super.getValues('span[class="topcard__flavor topcard__flavor--bullet"]', 'innerText');

      let posted = await super.getValues('span.topcard__flavor--metadata.posted-time-ago__text', 'innerText');

      const description = await super.getValues('div[class="show-more-less-html__markup show-more-less-html__markup--clamp-after-5"]', 'innerText');
      posted = this.convertPostedToDate(posted);
      let state = '';
      if (!location.match(/([^,]*)/g)[2]) {
        state = 'United States';
      } else {
        state = location.match(/([^,]*)/g)[2].trim();
      }
      this.listings.addListing({
        position: position,
        company: company.trim(),
        location: {
          city: location.match(/([^,]*)/g)[0].trim(),
          state: state.trim(),
        },
        posted: posted,
        url: skippedURLs[i],
        skills: skills,
        lastScraped: lastScraped,
        description: description,
      });
      this.log.info(position);
      totalInternships++;
    }
    this.log.info('Total internships scraped:', totalInternships);
    this.log.info('Closing browser!');
  }

  async processListings() {
    await super.processListings();
    // Not yet implemented.
  }
}