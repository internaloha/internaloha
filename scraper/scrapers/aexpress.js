import Logger from 'loglevel';
import { fetchInfo, startBrowser, writeToJSON } from './scraperFunctions.js';

async function getData(page) {
  const results = [];
  for (let i = 0; i < 3; i++) {
    // Get position, location, and description
    results.push(fetchInfo(page, 'h1[itemprop="title"]', 'innerText'));
    results.push(fetchInfo(page, 'li[itemprop="jobLocation"]', 'innerText'));
    results.push(fetchInfo(page, 'article[itemprop="description"]', 'innerHTML'));
  }
  return Promise.all(results);
}

async function setSearchFilters(page) {
  // Navigate to internship page
  await page.waitForSelector('input[id="keyword-search"]');
  await page.type('input[id="keyword-search"]', 'internship');
  await page.waitForSelector('input[id="location-search"]');
  await page.type('input[id="location-search"]', 'United States');
  await page.click('button[id="search-btn"]');
}

async function main() {
  let browser;
  let page;
  const data = [];
  Logger.enableAll(); // Enable console logs, will replace with CLI control later.
  try {
    Logger.info('Executing script...');
    [browser, page] = await startBrowser();
    await page.goto('https://jobs.americanexpress.com/jobs');
    await setSearchFilters(page);
    await page.waitForSelector('mat-panel-title > p > a');
    const urls = await page.evaluate(() => Array.from(
        document.querySelectorAll('mat-panel-title > p > a'),
        a => a.href,
    ));

    for (let i = 0; i < urls.length; i++) {
      try {
        await page.goto(urls[i]);
        const city = 'N/A';
        const state = 'Error';
        const company = 'American Express';
        const contact = 'https://careers.americanexpress.com/';
        const lastScraped = new Date();
        const [position, location, description] = await getData(page);
        data.push({
          position: position,
          company: company,
          contact: contact,
          url: urls[i],
          lastScraped: lastScraped,
          location: { city: city, state: state, country: location.trim() },
          description: description,
        });
      } catch (err2) {
        Logger.debug(err2.message);
      }
    }
    await writeToJSON(data, 'aexpress');
    await browser.close();
  } catch (err) {
    Logger.debug(err.message);
    await browser.close();
  }
}

main();
