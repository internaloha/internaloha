import puppeteer from 'puppeteer';
import fs from 'fs';
import log from 'loglevel';
import { fetchInfo } from './scraperFunctions.js';

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
  });
  log.enableAll(); // Enables all console logging tags
  const data = [];
  try {
    const page = await browser.newPage();
    // time out after 10 seconds
    await page.setDefaultNavigationTimeout(10000);
    await page.setViewport({ width: 1200, height: 1000 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');
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
      log.warn('Our Error:', err2.message);
    }
    await page.waitForSelector('div[class="serp-filters-sort-by-container"]');
    const date = await page.evaluate(
      () => Array.from(
        // eslint-disable-next-line no-undef
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
      log.trace('Sorting by last 14 days...');
    } catch (err3) {
      log.warn('Our Error: No sorting by date posted.');
    }
    let internshipDropdown = [];
    try {
      await page.waitForSelector('ul[id="filter-job-type-menu"] li a[href*="internship"]');
      // Getting href link for internship filter
      internshipDropdown = await page.evaluate(
        () => Array.from(
          // eslint-disable-next-line no-undef
          document.querySelectorAll('ul[id="filter-job-type-menu"] li a[href*="internship"]'),
          a => a.getAttribute('href'),
        ),
      );
    } catch (err4) {
      log.warn('No filter link');
    }
    if (internshipDropdown.length === 1) {
      await page.goto(`https://www.indeed.com${internshipDropdown[0]}`);
      log.trace('Filtering by internship tag...');
    } else {
      log.warn('No internship tag.');
    }
    const skippedLinks = [];
    let totalJobs = 0;
    const urls = [];
    let hasNext = true;
    // while there a next page, keep clicking
    while (hasNext === true) {
      // getting all job link for that page
      await page.waitForSelector('div[class="jobsearch-SerpJobCard unifiedRow row result clickcard"] h2.title a');
      const url = await page.evaluate(
        () => Array.from(
          // eslint-disable-next-line no-undef
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
        log.trace('Reached the end of pages!');
        hasNext = false;
      }
    }
    log.info('Total pages:', urls.length);
    log.info('Total jobs: ', totalJobs);
    log.info(urls);
    // go through urls array to fetch info
    for (let i = 0; i < urls.length; i++) {
      for (let j = 0; j < urls[i].length; j++) {
        await page.goto(`https://www.indeed.com${urls[i][j]}`);
        try {
          // If we cannot fetch indeed logo, it means page has not loaded
          let position = '';
          // position alternates between two different css class
          try {
            await page.click('div[class="jobsearch-JobInfoHeader-title-container "]');
            position = await fetchInfo(page, 'div[class="jobsearch-JobInfoHeader-title-container "]', 'innerText');
          } catch (noClassError) {
            log.trace('--- Trying with other class name ---');
            position = await fetchInfo(page, 'div[class="jobsearch-JobInfoHeader-title-container jobsearch-JobInfoHeader-title-containerEji"]', 'innerText');
          }
          const company = await fetchInfo(page, 'div[class="icl-u-lg-mr--sm icl-u-xs-mr--xs"]', 'innerText');
          let location = '';
          try {
            await page.click('div[class="jobsearch-InlineCompanyRating icl-u-xs-mt--xs jobsearch-DesktopStickyContainer-companyrating"] div:nth-child(4)');
            location = await fetchInfo(page, 'div[class="jobsearch-InlineCompanyRating icl-u-xs-mt--xs jobsearch-DesktopStickyContainer-companyrating"] div:nth-child(4)', 'innerText');
          } catch (noLocation) {
            log.trace('--- Trying with other class name ---');
            location = await fetchInfo(page, 'div[class="jobsearch-InlineCompanyRating icl-u-xs-mt--xs  jobsearch-DesktopStickyContainer-companyrating"] div:last-child', 'innerText');
          }
          let posted = await fetchInfo(page, 'div[class="jobsearch-JobMetadataFooter"]', 'innerText');
          const description = await fetchInfo(page, 'div[class="jobsearch-jobDescriptionText"]', 'innerHTML');
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
          log.info(position);
        } catch (err6) {
          log.trace('--- Error with scraping... Skipping ---');
          skippedLinks.push(`https://www.indeed.com${urls[i][j]}`);
        }
      }
    }
    // write results to JSON file
    await fs.writeFile('./data/canonical/indeed.canonical.data.json',
      JSON.stringify(data, null, 4), 'utf-8',
      err => (err ? log.warn('\nData not written!', err) :
        log.trace('\nData successfully written!')));
    log.info('Total links skipped:', skippedLinks.length);
    log.info('Total internships scraped:', totalJobs);
    log.info(skippedLinks);
    await browser.close();
  } catch (e) {
    await fs.writeFile('./data/canonical/indeed.canonical.data.json',
      JSON.stringify(data, null, 4), 'utf-8',
      err => (err ? log.warn('\nData not written!', err) :
        log.trace('\nData successfully written!')));
    log.warn('Our Error:', e.message);
    await browser.close();
  }
}

main();
