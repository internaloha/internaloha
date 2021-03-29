import Logger from 'loglevel';
import moment from 'moment';
import { fetchInfo, startBrowser, writeToJSON } from './scraper-functions.js';

async function getData(page) {
  const results = [];
  for (let i = 0; i < 3; i++) {
    // get title, location, description
    results.push(fetchInfo(page, 'h2[itemprop="title"]', 'innerText'));
    results.push(fetchInfo(page, 'div[itemprop="jobLocation"]', 'innerText'));
    results.push(fetchInfo(page, 'div[itemprop="description"]', 'innerHTML'));
  }
  return Promise.all(results);
}

export async function main(headless) {
  let browser;
  let page;
  const data = [];
  const startTime = new Date();
  try {
    Logger.error('Starting scraper Cisco at', moment().format('LT'));
    [browser, page] = await startBrowser(headless);
    await page.goto('https://jobs.cisco.com/jobs/SearchJobs/?21178=%5B169482%5D&21178_format=6020&21180=%5B165%5D&21180_format=6022&21181=%5B186%2C194%2C201%2C187%2C191%2C196%2C197%2C67822237%2C185%2C55816092%5D&21181_format=6023&listFilterMode=1');
    await page.waitForNavigation;
    const urlList = [];
    let hasPage = await page.$('div[class="pagination autoClearer"] a:last-child');
    // Case when there is no "next" link.
    if (hasPage === null) {
      const urls = await page.evaluate(() => Array.from(
        document.querySelectorAll('table[class="table_basic-1 table_striped"] tbody tr td[data-th="Job Title"] a'),
        a => a.href,
      ));
      urlList.push(urls);
    }
    // Case where there is a next link
    while (hasPage !== null) {
      const urls = await page.evaluate(() => Array.from(
        document.querySelectorAll('table[class="table_basic-1 table_striped"] tbody tr td[data-th="Job Title"] a'),
        a => a.href,
      ));
      urlList.push(urls);
      await page.click('div[class="pagination autoClearer"] a:last-child');
      await page.waitForTimeout(2000);
      hasPage = await page.$('div[class="pagination autoClearer"] a:last-child');
    }
    const lastScraped = new Date();
    for (let i = 0; i < urlList.length; i++) {
      for (let j = 0; j < urlList[i].length; j++) {
        await page.goto(urlList[i][j]);
        const [position, location, description] = await getData(page);
        data.push({
          url: urlList[i][j],
          position: position,
          company: 'Cisco',
          location: {
            city: location.match(/^([^,]*)/)[0],
            state: location.match(/([^ ,]*)$/)[0],
          },
          lastScraped: lastScraped,
          description: description,
        });
      }
    }
    await writeToJSON(data, 'cisco');
    await browser.close();
  } catch (err) {
    Logger.error(err.message);
    await browser.close();
  }
  Logger.error(`Elapsed time for Cisco: ${moment(startTime).fromNow(true)} | ${data.length} listings scraped `);
}

export default main;
