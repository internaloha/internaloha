import Logger from 'loglevel';
import { fetchInfo, startBrowser, writeToJSON, checkHeadlessOrNot } from './scraper-functions.js';

async function getData(page) {
  const results = [];
  for (let i = 0; i < 6; i++) {
    // get title, company, description, city, state, and zip
    results.push(fetchInfo(page, 'h1[itemprop="title"]', 'innerText'));
    results.push(fetchInfo(page, 'div[class="arDetailCompany"]', 'innerText'));
    results.push(fetchInfo(page, 'div[itemprop="description"]', 'innerHTML'));
    results.push(fetchInfo(page, 'span[itemprop="addressLocality"]', 'innerText'));
    results.push(fetchInfo(page, 'span[itemprop="addressRegion"]', 'innerText'));
    results.push(fetchInfo(page, 'span[itemprop="postalCode"]', 'innerText'));
  }
  return Promise.all(results);
}

export async function main(headless) {
  let browser;
  let page;
  const data = [];
  try {
    Logger.info('Executing script for ACM...');
    [browser, page] = await startBrowser(headless);
    await page.goto('https://jobs.cisco.com/jobs/SearchJobs/');
    await page.waitForNavigation;
    const urlList = [];
    let hasPage = await page.$('div[class="pagination autoClearer"] a:last-child');
    console.log(hasPage);
    while (hasPage !== null) {
      const urls = await page.evaluate(() => Array.from(
        document.querySelectorAll('table[class="table_basic-1 table_striped"] tbody tr td[data-th="Job Title"] a'),
        a => a.href,
      ));
      urlList.push(urls);
      await page.click('div[class="pagination autoClearer"] a:last-child');
      await page.waitFor(2000);
      hasPage = await page.$('div[class="pagination autoClearer"] a:last-child');
    }

    console.log(urlList);

    await writeToJSON(data, 'cisco');
    // await browser.close();
  } catch (err) {
    Logger.error(err.message);
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
