import Logger from 'loglevel';
import moment from 'moment';
import { fetchInfo, startBrowser, writeToJSON } from './scraper-functions.js';

async function getData(page) {
  const results = [];
  for (let i = 0; i < 5; i++) {
    // position, company, posted, location, description
    results.push(fetchInfo(page, 'h1[name="job_title"]', 'innerText'));
    results.push(fetchInfo(page, 'div[name="job_company_name"]', 'innerText'));
    results.push(fetchInfo(page, 'p[id="jobPostedValue"]', 'innerText'));
    results.push(fetchInfo(page, 'div[name="job_company_location"]', 'innerText'));
    results.push(fetchInfo(page, 'div[name="sanitizedHtml"]', 'innerHTML'));
  }
  return Promise.all(results);
}

export async function main(headless) {
  let browser;
  let page;
  const data = [];
  const startTime = new Date();
  const scraperName = 'Monster: ';
  try {
    [browser, page] = await startBrowser(headless);
    Logger.error('Starting scraper monster at', moment().format('LT'));
    await page.goto('https://www.monster.com/jobs/search/?q=computer-science-intern&intcid=skr_navigation_nhpso_searchMain&tm=30');
    await page.waitForSelector('div[name="job-results-list"]', { timeout: 0 });
    const totalResults = 1000;
    let currentResult = await page.$$('div[class="results-card"]');
    let j = 2;
    let error = 0;
    while (currentResult.length < totalResults && error <= 1000) {
      try {
        const oldVal = currentResult;
        currentResult = await page.$$('div[class="results-card "]');
        if (oldVal.length === currentResult.length) {
          error++;
          await currentResult[j].hover();
          await page.waitForTimeout(1000);
        } else {
          await Promise.all([
            await currentResult[j].hover(),
            await page.waitForTimeout(6000),
          ]);
        }
        j++;
      } catch (e5) {
        Logger.debug('Reached the end of page');
      }
    }
    // await reload(page);
    const urls = await page.evaluate(() => {
      const urlFromWeb = document.querySelectorAll('a[class="view-details-link"]');
      const urlList = [...urlFromWeb];
      return urlList.map(url => url.href);
    });
    Logger.debug('Loaded all listings: ', urls.length);

    let totalJobs = 0;
    for (let i = 0; i < urls.length; i++) {
      try {
        await page.goto(urls[i], { waitUntil: 'domcontentloaded' });
        const date = new Date();
        const lastScraped = new Date();
        await page.waitForTimeout(500);
        const [position, company, posted, location, description] = await getData(page);
        let daysToGoBack = 0;
        if (posted.includes('today')) {
          daysToGoBack = 0;
        } else {
          // getting just the number (eg. 1, 3, 20...)
          daysToGoBack = posted.match(/\d+/g);
        }
        // going backwards
        date.setDate(date.getDate() - daysToGoBack);
        let zip = location.split(',')[1].split(' ')[2];
        if (zip === null || typeof zip === 'undefined') {
          zip = 'N/A';
        }
        data.push({
          position: position.trim(),
          company: company.trim(),
          location: {
            city: location.split(',')[0],
            state: location.split(',')[1].split(' ')[1],
            zip: zip,
          },
          url: urls[i],
          posted: date,
          lastScraped: lastScraped,
          description: description.trim(),
        });
        totalJobs++;
      } catch (err) {
        Logger.debug(scraperName, err.message);
        Logger.debug(scraperName, 'Error fetching link, skipping');
      }
    }

    // write results to JSON file
    await writeToJSON(data, 'monster');
    await Logger.debug('Total internships scraped:', totalJobs);
    await browser.close();
  } catch (e) {
    Logger.error(scraperName, 'Our Error: ', e.message);
    await browser.close();
  }
  Logger.error(`Elapsed time for monster: ${moment(startTime).fromNow(true)} | ${data.length} listings scraped `);
}

export default main;
