import Logger from 'loglevel';
import { checkHeadlessOrNot, fetchInfo, startBrowser, writeToJSON } from './scraper-functions.js';

async function getData(page) {
  const results = [];
  // Scrapes position, location, company, posted, and description
  for (let i = 0; i < 5; i++) {
    results.push(fetchInfo(page, 'h1[class="icl-u-xs-mb--xs icl-u-xs-mt--none jobsearch-JobInfoHeader-title"]', 'innerText'));
    results.push(fetchInfo(page, 'div[class="jobsearch-CompanyInfoWithoutHeaderImage jobsearch-CompanyInfoWithReview"] > div > div > div:nth-child(2)', 'innerText'));
    results.push(fetchInfo(page, 'div[class="icl-u-lg-mr--sm icl-u-xs-mr--xs"]', 'innerText'));
    results.push(fetchInfo(page, 'div[class="jobsearch-JobMetadataFooter"]', 'innerText'));
    results.push(fetchInfo(page, 'div[class="jobsearch-jobDescriptionText"]', 'innerHTML'));
  }
  return Promise.all(results);
}

async function main(headless) {
  let browser;
  let page;
  const data = [];
  try {
    Logger.debug('Executing script for indeed...');
    [browser, page] = await startBrowser(headless);
    // time out after 10 seconds
    await page.goto('https://www.indeed.com/');
    await page.waitForSelector('input[id="text-input-what"]');
    await page.waitForSelector('button[class="icl-Button icl-Button--primary icl-Button--md icl-WhatWhere-button"]');
    await page.type('input[id="text-input-what"]', 'computer science intern');
    await page.click('button[class="icl-Button icl-Button--primary icl-Button--md icl-WhatWhere-button"]');
    await page.waitForSelector('input[id="where"]');
    await page.waitForSelector('input[id="fj"]');
    // eslint-disable-next-line no-return-assign,no-param-reassign
    await page.$eval('input[id="where"]', (el) => el.value = '');
    await page.click('input[id="fj"]');
    // closing module that pops up
    try {
      await page.waitForSelector('a[class="icl-CloseButton popover-x-button-close"]', { timeout: 5000 });
      await page.waitForTimeout(2000);
      await page.click('a[class="icl-CloseButton popover-x-button-close"]');
    } catch (err2) {
      Logger.error('Our Error:', err2.message);
    }
    await page.waitForSelector('div[class="serp-filters-sort-by-container"]');
    const date = await page.evaluate(
      () => Array.from(
        document.querySelectorAll('a[href*="sort=date"]'),
        a => a.getAttribute('href'),
      ),
    );
    await page.goto(`https://www.indeed.com${date}`);
    // try to only show those posted within last 14 days
    try {
      await page.click('button[class="dropdown-button dd-target"]');
      await page.waitForTimeout(1000);
      await page.click('li[onmousedown="rbptk(\'rb\', \'dateposted\', \'4\');"]');
      Logger.trace('Sorting by last 14 days...');
    } catch (err3) {
      Logger.error('Our Error: No sorting by date posted.');
    }
    let internshipDropdown = [];
    try {
      await page.waitForSelector('ul[id="filter-job-type-menu"] li a[href*="internship"]');
      // Getting href link for internship filter
      internshipDropdown = await page.evaluate(
        () => Array.from(
          document.querySelectorAll('ul[id="filter-job-type-menu"] li a[href*="internship"]'),
          a => a.getAttribute('href'),
        ),
      );
    } catch (err4) {
      Logger.warn('No filter link');
    }
    if (internshipDropdown.length === 1) {
      await page.goto(`https://www.indeed.com${internshipDropdown[0]}`);
      Logger.trace('Filtering by internship tag...');
    } else {
      Logger.warn('No internship tag.');
    }
    let totalJobs = 0;
    const urls = [];
    let hasNext = true;
    while (hasNext === true) {
      await page.waitForSelector('div[class="jobsearch-SerpJobCard unifiedRow row result clickcard"] h2.title a');
      const url = await page.evaluate(
        () => Array.from(
          document.querySelectorAll('div[class="jobsearch-SerpJobCard unifiedRow row result clickcard"] h2.title a'),
          a => a.getAttribute('href'),
        ),
      );
      totalJobs += url.length;
      urls.push(url);
      // keep clicking next until it reaches end
      try {
        await page.waitForTimeout(1000);
        await page.click('li a[aria-label="Next"]');
      } catch (err4) {
        Logger.trace('Reached the end of pages!');
        hasNext = false;
      }
    }
    Logger.info('Total pages:', urls.length);
    Logger.info('Total jobs: ', totalJobs);
    Logger.info(urls);
    // go through urls array to fetch info
    for (let i = 0; i < urls.length; i++) {
      for (let j = 0; j < urls[i].length; j++) {
        await page.goto(`https://www.indeed.com${urls[i][j]}`);
        try {
          await page.waitForSelector('h1[class="icl-u-xs-mb--xs icl-u-xs-mt--none jobsearch-JobInfoHeader-title"]');
          // eslint-disable-next-line prefer-const
          let [position, location, company, posted, description] = await getData(page);
          const lastScraped = new Date();
          const skills = 'N/A';
          const todayDate = new Date();
          let daysBack = 0;
          if (posted.includes('hours') || (posted.includes('hour')) || (posted.includes('minute'))
            || (posted.includes('minutes'))) {
            daysBack = 0;
          } else if ((posted.includes('week')) || (posted.includes('weeks'))) {
            daysBack = posted.match(/\d+/g) * 7;
          } else {
            daysBack = posted.match(/\d+/g);
          }
          todayDate.setDate(todayDate.getDate() - daysBack);
          // eslint-disable-next-line no-const-assign
          posted = todayDate;
          let state = '';
          if (!location.match(/([^,]*)/g)[2]) {
            state = 'United States';
          } else {
            state = location.match(/([^,\d])+/g)[1].trim();
          }
          let zip = location.match(/([^\D,])+/g);
          if (zip != null) {
            zip = zip[0];
          } else {
            zip = 'N/A';
          }
          data.push({
            position: position,
            company: company,
            location: {
              city: location.match(/([^,]*)/g)[0],
              state: state,
              zip: zip,
            },
            posted: posted,
            url: `https://www.indeed.com${urls[i][j]}`,
            skills: skills,
            lastScraped: lastScraped,
            description: description,
          });
          Logger.info(position);
        } catch (err6) {
          Logger.trace('--- Error with scraping... Skipping ---');
        }
      }
    }
    // write results to JSON file
    await writeToJSON(data, 'indeed');
    Logger.info('Total internships scraped:', totalJobs);
    await browser.close();
  } catch (e) {
    Logger.warn('Our Error:', e.message);
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
