import Logger from 'loglevel';
import { fetchInfo, autoScroll, startBrowser, writeToJSON } from './scraperFunctions.js';

async function getData(page) {
  const results = [];
  for (let i = 0; i < 5; i++) {
    // get title, company, description, city, and state
    results.push(fetchInfo(page, 'h1[itemprop="title"]', 'innerText'));
    results.push(fetchInfo(page, 'div[class="arDetailCompany"]', 'innerText'));
    results.push(fetchInfo(page, 'div[itemprop="description"]', 'innerHTML'));
    results.push(fetchInfo(page, 'span[itemprop="addressLocality"]', 'innerText'));
    results.push(fetchInfo(page, 'span[itemprop="addressRegion"]', 'innerText'));
  }
  return Promise.all(results);
}

async function setSearchFilter(page) {
  try {
    await page.waitForSelector('input[id="searchview"]');
    await page.type('input[id="searchview"]', 'internship');
    await page.keyboard.press('Enter');
    await page.waitForSelector('button[id="locations-filter-acc"]');
    await page.click('button[id="locations-filter-acc"]');
    await page.waitForSelector('input[id="locations-filter-input"]');
    await page.click('input[id="locations-filter-input"]');
    // Separated 'United' and 'States' so that dropdown list comes out
    await page.type('input[id="locations-filter-input"]', 'United');
    await page.type('input[id="locations-filter-input"]', ' States');
    // Delay prevents code from bypassing page changes
    /** await delay(5000);
    await page.waitForSelector('li[id="locations-filter-input-option-0"]');
    await page.click('li[id="locations-filter-input-option-0"]');
    await delay(5000);* */
  } catch (err2) {
    Logger.debug(err2.message);
  }
}

async function main() {
  const data = [];
  let browser;
  let page;
  Logger.enableAll(); // this enables console logging. Will replace with CLI args later.
  try {
    Logger.info('Executing script...');
    [browser, page] = await startBrowser();
    await page.goto('https://www.linkedin.com/jobs/search?keywords=Computer%2BScience&location=United%2BStates&geoId=103644278&trk=public_jobs_jobs-search-bar_search-submit&f_TP=1%2C2%2C3%2C4&f_E=1&f_JT=I&redirect=false&position=1&pageNum=0');
    await autoScroll(page);
    await setSearchFilter(page);
    /** let loadMore = true;
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
    }* */
    /** const elements = await page.$$('li[class="result-card job-result-card result-card--with-hover-state"]');
     const times = await page.evaluate(
     () => Array.from(
     // eslint-disable-next-line no-undef
     document.querySelectorAll('div.result-card__meta.job-result-card__meta time:last-child'),
     a => a.textContent,
     ),
     ); * */
    let nextPage = true;
    while (nextPage === true) {
      try {
        await page.waitForTimeout(2000);
        await page.waitForSelector('div[class="mux-search-results"]');
        await page.click('a[id="loadMoreJobs"]');
        Logger.info('Nagivating to next page....');
      } catch (e2) {
        Logger.debug('Finished loading all pages.');
        nextPage = false;
      }
      await page.waitForNavigation;
      const totalPage = await page.evaluate(() => document.querySelectorAll('ul[class="pagination"] li').length);
      // for loop allows for multiple iterations of pages -- start at 2 because initial landing is page 1
      for (let i = 2; i <= totalPage; i++) {
        // Fetching all urls in page into a list
        const urls = await page.evaluate(() => {
          const urlFromWeb = document.querySelectorAll('h3 a');
          const urlList = [...urlFromWeb];
          return urlList.map(url => url.href);
        });
        // Iterate through all internship positions
        try {
          for (let j = 0; j < urls.length; j++) {
            await page.goto(urls[j]);
            const lastScraped = new Date();
            const [position, company, description, city, state] = await getData(page);
            // const date = new Date(posted).toISOString();
            data.push({
              url: urls[i],
              position: position,
              company: company.trim(),
              location: { city: city, state: state },
              lastScraped: lastScraped,
              description: description,
            });
          }
        } catch (err1) {
          Logger.error(err1.message);
        }
      }
      // write results to JSON file
      await writeToJSON(data, 'linkedin');
    }
  } catch (err1) {
    Logger.debug('Our Error:', err1.message);
    Logger.debug('\nData successfully written!');
    await browser.close();
  }
}
main();
