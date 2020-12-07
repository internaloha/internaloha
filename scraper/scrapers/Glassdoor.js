/* eslint-disable no-await-in-loop */
import puppeteer from 'puppeteer';
import fs from 'fs';
import { fetchInfo } from './scraperFunctions.js';

async function scrapeInfo(page, posted, url, data) {
  const position = await fetchInfo(page, 'div[class="css-17x2pwl e11nt52q6"]', 'innerText');
  await page.waitForSelector('div[class="css-16nw49e e11nt52q1"]');
  let company = '';
  try {
    company = await page.evaluate(() => document.querySelector('div[class="css-16nw49e e11nt52q1"]').childNodes[0].nodeValue);
  } catch (err5) {
    company = await fetchInfo(page, 'div[class="css-16nw49e e11nt52q1"]', 'innerText');
  }
  const location = await fetchInfo(page, 'div[class="css-1v5elnn e11nt52q2"]', 'innerText');
  const description = await fetchInfo(page, 'div[class="desc css-58vpdc ecgq1xb4"]', 'innerHTML');

  const date = new Date();
  let daysBack = 0;
  const lastScraped = new Date();

  if (posted.includes('h') || posted.includes('hours')) {
    daysBack = 0;
  } else {
    daysBack = posted.match(/\d+/g);
  }

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
  console.log(`${position} | ${company}`);
}

(async () => {

  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1100, height: 900,
  });

  // eslint-disable-next-line max-len
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');

  const data = [];

  try {

    // filter by internship tag
    await page.goto('https://www.glassdoor.com/Job/computer-science-intern-jobs-SRCH_KO0,23.htm');

    console.log('Filtering by internships...');
    await page.waitForSelector('div[id="filter_jobType"]');
    await page.click('div[id="filter_jobType"]');
    await page.waitForSelector('div[id="filter_jobType"]');
    await page.click('li[value="internship"]');
    await page.waitFor(3000);

    console.log('Selecting last 30 days');
    await page.waitForSelector('div[id="filter_fromAge"]');
    await page.click('div[id="filter_fromAge"]');
    await page.waitForSelector('li[value="30"]');
    await page.click('li[value="30"]');
    await page.waitFor(3000);

    console.log('Sorting by most recent');
    await page.waitForSelector('div[data-test="sort-by-header"]');
    await page.click('div[data-test="sort-by-header"]');
    await page.waitForSelector('li[data-test="date_desc"]');
    await page.click('li[data-test="date_desc"]');

    await page.waitFor(3000);

    let postedDates = [];
    let urlArray = [];
    const skippedJobs = [];
    const skippedDates = [];

    let pageLimit = await fetchInfo(page, 'div[class="cell middle hideMob padVertSm"]', 'innerHTML');
    pageLimit = pageLimit.match(/(\d)+$/gm);
    let currentPage = 1;
    console.log('Pages: ', pageLimit[0]);

    try {
      while (pageLimit[0] !== currentPage) {
        currentPage++;
        // grab all post dates
        const dates = await page.evaluate(
            () => Array.from(
                // eslint-disable-next-line no-undef
                document.querySelectorAll('div[data-test="job-age"]'),
                a => a.innerHTML,
            ),
        );

        postedDates = postedDates.concat(dates);

        // grab all links
        const URLs = await page.evaluate(
            () => Array.from(
                // eslint-disable-next-line no-undef
                document.querySelectorAll('div[class="jobHeader d-flex justify-content-between align-items-start"] a'),
                a => `https://glassdoor.com${a.getAttribute('href')}`,
            ),
        );

        urlArray = urlArray.concat(URLs);

        await page.click('a[data-test="pagination-next"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        console.log('Navigating to next page...');
      }
    } catch (err1) {
      console.log('Reached end. Scrapping pages now...');

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
        console.log(err5.message);
        console.log('Loading error, skipping');
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

    console.log('Total Jobs scraped: ', urlArray.length);

    await fs.writeFile('./data/canonical/glassdoor.canonical.data.json',
        JSON.stringify(data, null, 4), 'utf-8',
        err => (err ? console.log('\nData not written!', err) :
            console.log('\nData successfully written!')));

    await browser.close();
  } catch
      (err4) {
    await fs.writeFile('./data/canonical/glassdoor.canonical.data.json',
        JSON.stringify(data, null, 4), 'utf-8',
        err => (err ? console.log('\nData not written!', err) :
            console.log('\nData successfully written!')));
    console.log('Our Error:', err4.message);
    await browser.close();
  }

})
();
