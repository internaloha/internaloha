import Logger from 'loglevel';
import moment from 'moment';
import { fetchInfo, startBrowser, writeToJSON } from './scraper-functions.js';

async function getData(page, id) {
  const results = [];
  for (let i = 0; i < 6; i++) {
    // get title, company, description, city, state, and zip
    results.push(fetchInfo(page, `#${id} h5[class="panel-vacancy__title"]`, 'innerText'));
    results.push(fetchInfo(page, `#${id} div[class="panel-vacancy__summary"]`, 'innerText'));
    results.push(fetchInfo(page, `#${id} div[class="panel-vacancy__job-description"] p`, 'innerText'));
    results.push(fetchInfo(page, `#${id} div[class="panel-vacancy__location"]`, 'innerText'));
    results.push('N/A');
    results.push('N/A');
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

    await page.waitForSelector('.panel');
    let urls = await page.evaluate(() => {
      const urlFromWeb = document.querySelectorAll('.panel a');
      const urlList = [...urlFromWeb];
      return urlList.map(url => url.href);
    });

    urls = urls.filter((url) => url.includes('https://80000hours.org/job-board/?role='));

    try {
      for (let j = 0; j < urls.length; j++) {
        const divID = urls[j].replace('https://80000hours.org/job-board/?role=', '');
        await page.goto(urls[j]);
        const lastScraped = new Date();
        const [position, company, description, city, state, zip] = await getData(page, divID);
        data.push({
          url: urls[j],
          position: position,
          company: company.trim(),
          location: { city: city, state: state, zip: zip },
          lastScraped: lastScraped,
          description: description,
        });
      }
    } catch (err1) {
      Logger.error(scraperName, err1.message);
    }

    await writeToJSON(data, '80000hours');
    await browser.close();
  } catch (err2) {
    Logger.error(scraperName, err2.message);
    await browser.close();
  }
  Logger.error(`Elapsed time for 80000hours: ${moment(startTime).fromNow(true)} | ${data.length} listings scraped `);
}

export default main;
