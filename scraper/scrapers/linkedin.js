import Logger from 'loglevel';
import { fetchInfo, autoScroll, writeToJSON, startBrowser, convertPostedToDate, checkHeadlessOrNot } from './scraper-functions.js';

async function getData(page) {
  const results = [];
  for (let i = 0; i < 5; i++) {
    results.push(fetchInfo(page, 'h2.topcard__title', 'innerText'));
    results.push(fetchInfo(page, 'a[data-tracking-control-name="public_jobs_topcard_org_name" ]', 'innerText'));
    results.push(fetchInfo(page, 'span[class="topcard__flavor topcard__flavor--bullet"]', 'innerText'));
    results.push(fetchInfo(page, 'span.topcard__flavor--metadata.posted-time-ago__text', 'innerText'));
    results.push(fetchInfo(page, 'div[class="show-more-less-html__markup show-more-less-html__markup--clamp-after-5"]', 'innerHTML'));
  }
  return Promise.all(results);
}

export async function main(headless) {
  let browser;
  let page;
  const data = [];
  try {
    Logger.info('Executing script for LinkedIn...');
    [browser, page] = await startBrowser(headless);
    await page.goto('https://www.linkedin.com/jobs/search?keywords=Computer%2BScience&location=United%2BStates&geoId=103644278&trk=public_jobs_jobs-search-bar_search-submit&f_TP=1%2C2%2C3%2C4&f_E=1&f_JT=I&redirect=false&position=1&pageNum=0');
    await page.waitForSelector('section.results__list');
    Logger.info('Fetching jobs...');
    await autoScroll(page);
    let loadMore = true;
    let loadCount = 0;
    let totalInternships = 0;
    // Sometimes infinite scroll stops and switches to a "load more" button
    while (loadMore === true && loadCount <= 15) {
      try {
        await page.waitForTimeout(1000);
        await page.click('button[data-tracking-control-name="infinite-scroller_show-more"]');
        loadCount++;
      } catch (e2) {
        loadMore = false;
        Logger.debug('Finished loading...');
      }
    }
    const elements = await page.$$('li[class="result-card job-result-card result-card--with-hover-state"]');
    // eslint-disable-next-line no-unused-vars
    const times = await page.evaluate(
        () => Array.from(
            // eslint-disable-next-line no-undef
            document.querySelectorAll('div.result-card__meta.job-result-card__meta time:last-child'),
            a => a.textContent,
        ),
    );

    const urls = await page.evaluate(
        () => Array.from(
            // eslint-disable-next-line no-undef
            document.querySelectorAll('a.result-card__full-card-link'),
            a => a.href,
        ),
    );

    Logger.info('Total Listings:', elements.length);
    const skippedURLs = [];
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      // sometimes clicking it doesn't show the panel, try/catch to allow it to keep going
      try {
        await page.waitForSelector('div[class="details-pane__content details-pane__content--show"]');
        const lastScraped = new Date();
        const [position, company, location, posted, description] = await getData(page);
        await convertPostedToDate(posted);
        let state = '';
        if (!location.match(/([^,]*)/g)[2]) {
          state = 'United States';
        } else {
          state = location.match(/([^,]*)/g)[2].trim();
        }
        data.push({
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
        Logger.debug(position);
        totalInternships++;
      } catch (err5) {
        Logger.trace(err5.message);
        Logger.trace('Skipping! Did not load...');
        skippedURLs.push(urls[i]);
      }
      await element.click();
    }

    Logger.info('--- Going back to scrape the ones previously skipped ---');
    // scraping the ones we skipped
    for (let i = 0; i < skippedURLs.length; i++) {
      await page.goto(skippedURLs[i]);
      await page.waitForSelector('section.core-rail');
      const skills = 'N/A';
      const lastScraped = new Date();
      const [position, company, location, posted, description] = await getData(page);
      await convertPostedToDate(posted);
      let state = '';
      if (!location.match(/([^,]*)/g)[2]) {
        state = 'United States';
      } else {
        state = location.match(/([^,]*)/g)[2].trim();
      }
      data.push({
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
      Logger.info(position);
      totalInternships++;
    }
    Logger.info('Total internships scraped:', totalInternships);
    Logger.info('Closing browser!');
    await writeToJSON(data, 'linkedin');
    await browser.close();
  } catch (e) {
    Logger.debug('Our Error:', e.message);
    await browser.close();
  }
}

if (process.argv.includes('main')) {
  const headless = checkHeadlessOrNot(process.argv);
  if (headless === -1) {
    Logger.error('Invalid argument supplied, please use "open", or "close"');
    process.exit(0);
  }
  main(headless);
}

export default main;
