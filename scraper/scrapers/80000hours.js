import Logger from 'loglevel';
import moment from 'moment';
import { fetchInfo, startBrowser, writeToJSON } from './scraper-functions.js';

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
  const scraperName = '80000hours: ';
  const startTime = new Date();
  try {
    Logger.error('Starting scraper 80000hours at', moment().format('LT'));
    [browser, page] = await startBrowser(headless);
    await page.setDefaultTimeout(60000);
    await page.goto('https://80000hours.org/job-board/ai-safety-policy/?role-type=internship');

    await page.waitForSelector('#single-job-list');
    const urls = await page.evaluate(() => {
      const urlFromWeb = document.querySelectorAll('#single-job-list a');
      const urlList = [...urlFromWeb];
      return urlList.map(url => url.href);
    });

    console.log(urls);

    await writeToJSON(data, '80000hours');
    await browser.close();
  } catch (err2) {
    Logger.error(scraperName, err2.message);
    await browser.close();
  }
  Logger.error(`Elapsed time for 80000hours: ${moment(startTime).fromNow(true)} | ${data.length} listings scraped `);
}

export default main;
