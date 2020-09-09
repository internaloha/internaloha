/* eslint-disable no-await-in-loop,no-console,max-len */
const puppeteer = require('puppeteer');
const fs = require('fs');

async function fetchInfo(page, selector) {
  let result = '';
  try {

    await page.waitForSelector(selector, { timeout: 1000 });
    result = await page.evaluate((select) => document.querySelector(select).innerHTML, selector);
  } catch (error) {
    console.log('Our Error: fetchInfo() failed.\n', error.message);
    throw error;
  }
  return result;
}

(async () => {

  const browser = await puppeteer.launch({
    headless: false,
  });

  try {

    const page = await browser.newPage();
    await page.setViewport({
      width: 1100, height: 900,
    });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');

    await page.goto('https://www.indeed.com/');
    await page.waitForSelector('input[id="text-input-what"]');
    await page.waitForSelector('button[class="icl-Button icl-Button--primary icl-Button--md icl-WhatWhere-button"]');
    await page.type('input[id="text-input-what"]', 'computer science intern');
    await page.click('button[class="icl-Button icl-Button--primary icl-Button--md icl-WhatWhere-button"]');

    await page.waitForSelector('input[id="where"]');
    await page.waitForSelector('input[id="fj"]');
    await page.$eval('input[id="where"]', (el) => el.value = '');
    await page.click('input[id="fj"]');

    // closing module that pops up
    try {
      await page.waitForSelector('a[class="icl-CloseButton popover-x-button-close"]');
      await page.waitFor(2000);
      await page.click('a[class="icl-CloseButton popover-x-button-close"]');
    } catch (err2) {
      console.log('Our Error:', err2.message);
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
    // sometimes the button doesn't show for some odd reason
    try {
      await page.click('button[class="dropdown-button dd-target"]');
      await page.waitFor(1000);
      await page.click('li[onmousedown="rbptk(\'rb\', \'dateposted\', \'4\');"]');
      console.log('Sorting by last 14 days...');
    } catch (err3) {
      console.log('Our Error: No sorting by date posted.');
    }

    await page.waitForSelector('span[id="filter-job-type"] li a[href*="internship"]');
    // Getting href link for internship filter
    const internshipDropdown = await page.evaluate(
        () => Array.from(
            // eslint-disable-next-line no-undef
            document.querySelectorAll('span[id="filter-job-type"] li a[href*="internship"]'),
            a => a.getAttribute('href'),
        ),
    );

    if (internshipDropdown.length === 1) {
      await page.goto(`https://www.indeed.com${internshipDropdown[0]}`);
      console.log('Filtering by internship tag...');
    } else {
      console.log('No internship tag.');
    }

    const data = [];
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
        await page.waitFor(1000);
        await page.click('li a[aria-label="Next"]');
      } catch (err4) {
        console.log('Reached the end of pages!');
        hasNext = false;
      }
    }

    console.log('Total pages:', urls.length);
    console.log('Total jobs: ', totalJobs);

    // go through urls array to fetch info
    for (let i = 0; i < urls.length; i++) {
      for (let j = 0; j < urls[i].length; j++) {

        await page.goto(`https://www.indeed.com${urls[i][j]}`);

        try {
          let position = '';
          // position alternates between two different css class
          try {
            position = await fetchInfo(page, 'div[class="jobsearch-JobInfoHeader-title-container jobsearch-JobInfoHeader-title-containerEji"]');
          } catch (noClassError) {
            console.log('--- Trying with other class name ---');
            position = await fetchInfo(page, 'div[class="jobsearch-JobInfoHeader-title-container"]');
          }
          const company = await fetchInfo(page, 'div[class="icl-u-lg-mr--sm icl-u-xs-mr--xs"]');
          let location = '';
          try {
            location = await fetchInfo(page, 'div[class="jobsearch-InlineCompanyRating icl-u-xs-mt--xs  jobsearch-DesktopStickyContainer-companyrating"] div:nth-child(4)');
          } catch (noLocation) {
            console.log('--- Trying with other class name ---');
            location = await fetchInfo(page, 'div[class="jobsearch-InlineCompanyRating icl-u-xs-mt--xs  jobsearch-DesktopStickyContainer-companyrating"] div:last-child');
          }
          let posted = await fetchInfo(page, 'div[class="jobsearch-JobMetadataFooter"]');

          const description = await fetchInfo(page, 'div[class="jobsearch-jobDescriptionText"]');
          const lastScraped = new Date();
          const skills = 'N/A';

          const todayDate = new Date();
          let daysBack = 0;

          if (posted.includes('hours') || (posted.includes('hour')) || (posted.includes('minute'))
              || (posted.includes('minutes'))) {
            daysBack = 0;
          } else
            if ((posted.includes('week')) || (posted.includes('weeks'))) {
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

          console.log(position);

        } catch (err6) {
          console.log('--- Error with scraping... Skipping ---');
          // console.log(err6.message);
          skippedLinks.push(`https://www.indeed.com${urls[i][j]}`);
        }
      }

    }

    // write results to JSON file
    await fs.writeFile('scrapers/data/canonical/indeed.canonical.data.json',
        JSON.stringify(data, null, 4), 'utf-8',
        err => (err ? console.log('\nData not written!', err) :
            console.log('\nData successfully written!')));

    console.log('Total links skipped:', skippedLinks.length);
    console.log('Total internships scraped:', totalJobs);
    console.log(skippedLinks);
    await browser.close();

  } catch (e) {
    console.log('Our Error:', e.message);
    await browser.close();
  }

})();
