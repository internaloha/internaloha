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
  const startTime = new Date();
  try {
    Logger.error('Starting scraper acm at', moment().format('LT'));
    [browser, page] = await startBrowser(headless);
    await page.goto('https://jobs.acm.org/jobs/results/title/Internship/United+States?normalizedCountry=US&radius=5&sort=scorelocation%20desc');
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
          const [position, company, description, city, state, zip] = await getData(page);
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
        Logger.error(err1.message);
      }
      // Return to original search url, but next page
      await page.goto(`https://jobs.acm.org/jobs/results/title/Internship/United+States?normalizedCountry=US&radius=5&sort=PostDate%20desc&page=${i}`);
    }
    await writeToJSON(data, 'acm');
    await browser.close();
  } catch (err) {
    Logger.error(err.message);
    await browser.close();
  }
  Logger.error(`Elapsed time for acm: ${moment(startTime).fromNow(true)} | ${data.length} listings scraped `);
}

export default main;
