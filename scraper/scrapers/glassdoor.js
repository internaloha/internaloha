import Logger from 'loglevel';
import moment from 'moment';
import { fetchInfo, startBrowser, writeToJSON } from './scraper-functions.js';

async function scrapeInfo(page, posted, url, data) {
  const position = await fetchInfo(page, 'div[class="css-17x2pwl e11nt52q6"]', 'innerText');
  await page.waitForSelector('div[class="css-16nw49e e11nt52q1"]');
  let company;
  try {
    company = await page.evaluate(() => document.querySelector('div[class="css-16nw49e e11nt52q1"]').childNodes[0].nodeValue);
  } catch (err5) {
    company = await fetchInfo(page, 'div[class="css-16nw49e e11nt52q1"]', 'innerText');
  }
  const location = await fetchInfo(page, 'div[class="css-1v5elnn e11nt52q2"]', 'innerText');
  const description = await fetchInfo(page, 'div[class="desc css-58vpdc ecgq1xb4"]', 'innerHTML');
  const date = new Date();
  const lastScraped = new Date();
  const daysBack = (posted.includes('h') || posted.includes('hours')) ? 0 : posted.match(/\d+/g);
  date.setDate(date.getDate() - daysBack);
  data.push({
    position: position,
    company: company,
    location: {
      city: location.match(/^([^,]*)/)[0],
      state: location.match(/([^ ,]*)$/)[0],
    },
    posted: date,
    url: url,
    lastScraped: lastScraped,
    description: description,
  });
  Logger.info(`${position} | ${company}`);
}

async function main(headless) {
  let browser;
  let page;
  const data = [];
  const scraperName = 'Glassdoor: ';
  const startTime = new Date();
  try {
    Logger.error('Starting scraper Glassdoor at', moment().format('LT'));
    [browser, page] = await startBrowser(headless);
    // filter by internship tag
    await page.goto('https://www.glassdoor.com/Job/computer-science-intern-jobs-SRCH_KO0,23.htm');
    Logger.info('Filtering by internships...');
    await page.waitForTimeout(3000);
    await page.waitForSelector('div[id="filter_jobType"]');
    await page.click('div[id="filter_jobType"]');
    await page.waitForTimeout(3000);
    await page.waitForSelector('li[value="internship"]');
    await page.click('li[value="internship"]');
    Logger.info('Internship tag added');
    await page.waitForTimeout(3000);
    Logger.info('Selecting last 30 days');
    await page.waitForSelector('div[id="filter_fromAge"]');
    await page.click('div[id="filter_fromAge"]');
    await page.waitForSelector('li[value="30"]');
    await page.click('li[value="30"]');
    await page.waitForTimeout(3000);
    Logger.info('Sorting by most recent');
    await page.waitForSelector('div[data-test="sort-by-header"]');
    await page.click('div[data-test="sort-by-header"]');
    await page.waitForSelector('li[data-test="date_desc"]');
    await page.click('li[data-test="date_desc"]');
    await page.waitForTimeout(3000);
    // Scraped Info
    let postedDates = [];
    let urlArray = [];
    const skippedJobs = [];
    const skippedDates = [];
    let pageLimit = await fetchInfo(page, 'div[class="cell middle d-none d-md-block py-sm"]', 'innerHTML');
    pageLimit = pageLimit.match(/(\d+)/gm);
    let currentPage = 1;
    Logger.info('Pages: ', pageLimit[1]);
    try {
      while (pageLimit[1] !== currentPage) {
        currentPage++;
        // grab all post dates
        const dates = await page.evaluate(
          () => Array.from(
            document.querySelectorAll('div[data-test="job-age"]'),
            a => a.innerHTML,
          ),
        );
        postedDates = postedDates.concat(dates);
        // grab all links
        await page.waitForTimeout(5000);
        const URLs = await page.evaluate(
          () => Array.from(
            document.querySelectorAll('a[data-test="job-link"]'),
            a => `https://glassdoor.com${a.getAttribute('href')}`,
          ),
        );
        Logger.info(URLs);
        urlArray = urlArray.concat(URLs);
        await page.click('a[data-test="pagination-next"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        Logger.info('Navigating to next page...');
        await page.waitForTimeout(5000);
        // close modal that pops up
        if (currentPage === 2) {
          await page.click('span[alt="Close"]');
        }
      }
    } catch (err1) {
      Logger.info('Reached end. Scrapping pages now...');
    }
    let countError = 0;
    let breakOut = false;
    for (let i = 0; i < urlArray.length; i++) {
      if (breakOut === true) {
        break;
      }
      try {
        await page.goto(urlArray[i]);
        await scrapeInfo(page, postedDates[i], urlArray[i], data);
      } catch (err5) {
        // If we fail to scrape a listing more than 15 times (eg. usually stopped due to recaptcha)
        if (countError > 15) {
          breakOut = true;
        }
        countError++;
        Logger.info(scraperName, err5.message);
        Logger.info('Loading error, skipping');
        skippedJobs.push(urlArray[i]);
        skippedDates.push(postedDates[i]);
      }
    }
    // Reset countError
    countError = 0;
    breakOut = false;
    for (let i = 0; i < skippedJobs.length; i++) {
      if (breakOut === true) {
        break;
      }
      await page.goto(skippedJobs[i]);
      try {
        await scrapeInfo(page, skippedDates[i], skippedJobs[i], data);
      } catch (err5) {
        if (countError > 15) {
          breakOut = true;
        }
        countError++;
      }
    }
    Logger.info('Total Jobs scraped: ', urlArray.length);
    await writeToJSON(data, 'glassdoor');
    await browser.close();
  } catch
    (err4) {
    Logger.warn(scraperName, 'Our Error: ', err4.message);
    await browser.close();
  }
  Logger.error(`Elapsed time for glassdoor: ${moment(startTime).fromNow(true)} | ${data.length} listings scraped `);
}

export default main;
