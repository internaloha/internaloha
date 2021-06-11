import Logger from 'loglevel';
import moment from 'moment';
import { fetchInfo, startBrowser, writeToJSON } from './scraper-functions.js';

async function getDescription(page) {
  const results = [];
  for (let i = 0; i < 3; i++) {
    // Get position, location, and description
    results.push(fetchInfo(page, 'h1[class="position-title"]', 'innerText'));
    results.push(fetchInfo(page, 'p[class="position-location"]', 'innerText'));
    results.push(fetchInfo(page, 'div[class="position-job-description"]', 'innerHTML'));
  }
  return Promise.all(results);
}

async function getData(page) {
  const data = [];
  try {
    await page.waitForTimeout(1000);
    const totalJobs = await fetchInfo(page, 'div[class="personalization-bar personalization-bar-pre-upload"] > div > span > span > strong', 'innerText');
    const numberOfJobs = await totalJobs.match(/\d+/g);
    Logger.info(totalJobs);
    for (let i = 0; i < numberOfJobs[0]; i++) {
      await page.waitForTimeout(500);
      const cardName = `div[data-test-id="position-card-${i}"]`;
      await page.click(cardName);
      const city = 'N/A';
      const state = 'Error';
      const company = 'American Express';
      const contact = 'https://careers.americanexpress.com/';
      const lastScraped = new Date();
      const url = await page.url();
      const [position, location, description] = await getDescription(page);
      data.push({
        position: position,
        company: company,
        contact: contact,
        url: url,
        lastScraped: lastScraped,
        location: { city: city, state: state, country: location.trim() },
        description: description,
      });
    }
  } catch (e) {
    Logger.trace('Reached the end of list of jobs!');
  }
  return data;
}

async function setSearchFilters(page) {
  // Navigate to internship page
  await page.waitForSelector('input[id="main-search-box"]');
  await page.type('input[id="main-search-box"]', 'internship');
  await page.waitForSelector('input[aria-label="Filter position by Location"]');
  await page.type('input[aria-label="Filter position by Location"]', 'USA');
  await page.keyboard.press('Enter');
}

async function main(headless) {
  let browser;
  let page;
  let data = [];
  const scraperName = 'Aexpress: ';
  const startTime = new Date();
  try {
    Logger.error('Starting scraper aexpress at', moment().format('LT'));
    [browser, page] = await startBrowser(headless);
    await page.goto('https://aexp.eightfold.ai/careers?intlink=us-amex-career-en-us-home-findalljobs');
    await setSearchFilters(page);
    data = await getData(page);
    await writeToJSON(data, 'aexpress');
    await browser.close();
  } catch (err2) {
    Logger.debug(scraperName, err2.message);
    await browser.close();
  }
  Logger.error(`Elapsed time for aexpress: ${moment(startTime).fromNow(true)} | ${data.length} listings scraped `);
}

export default main;
