import Logger from 'loglevel';
import { fetchInfo, startBrowser, writeToJSON } from './scraperFunctions.js';

/**
 * Adds delay time, since waitFor is deprecated.
 */
function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

async function getData(page) {
  const results = [];
  for (let i = 0; i < 4; i++) {
    // Get position, date, state, and city:
    results.push(fetchInfo(page, 'h1[itemprop="title"]', 'innerText'));
    results.push(fetchInfo(page, 'time[id="jobPostDate"]', 'innerText'));
    results.push(fetchInfo(page, 'div[id="jd-description"]', 'innerHTML'));
    results.push(fetchInfo(page, 'span[itemprop="addressLocality"]', 'innerText'));
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
    await delay(5000);
    await page.waitForSelector('li[id="locations-filter-input-option-0"]');
    await page.click('li[id="locations-filter-input-option-0"]');
    await delay(5000);
  } catch (err2) {
    Logger.debug(err2.message);
  }
}

async function main() {
  let browser;
  let page;
  const data = [];
  // Logger.enableAll(); // Enable console logs until CLI in place
  try {
    Logger.info('Executing script for apple...');
    [browser, page] = await startBrowser();
    await page.goto('https://jobs.apple.com/en-us/search?sort=relevance');
    await setSearchFilter(page);
    let totalPage = await page.evaluate(() => document.querySelector('form[id="frmPagination"] span:last-child').innerHTML);
    // if there is just 1 page, set totalPage to 3 because for loop below starts at 2
    if (totalPage === undefined) {
      totalPage = 3;
    }
    // for loop allows for multiple iterations of pages -- start at 2 because initial landing is page 1
    for (let i = 2; i < totalPage; i++) {
      await page.waitForSelector('a[class="table--advanced-search__title"]');
      const urls = await page.evaluate(() => Array.from(document.querySelectorAll('a[class="table--advanced-search__title"]'),
          a => a.href));
      for (let j = 0; j < urls.length; j++) {
        await page.goto(urls[j]);
        const lastScraped = new Date();
        const [position, posted, description, city, state] = await getData(page);
        const date = new Date(posted).toISOString();
        data.push({
          url: urls[j],
          position: position,
          posted: date,
          lastScraped: lastScraped,
          location: { city: city, state: state },
          description: description,
        });
      }
      // Uses i value in for loop to navigate search pages
      await page.goto(`https://jobs.apple.com/en-us/search?search=internship&sort=relevance&location=united-states-USA&page=${i}`);
    }
    await writeToJSON(data, 'apple');
    await browser.close();
  } catch (err) {
    await browser.close();
    Logger.debug(err.message);
  }
}

// main();

export default main;
