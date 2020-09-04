/* eslint-disable no-await-in-loop,no-console,max-len */
const puppeteer = require('puppeteer');
const fs = require('fs');

async function fetchInfo(page, selector) {
  let result = '';
  try {

    await page.waitForSelector(selector);
    result = await page.evaluate((select) => document.querySelector(select).textContent, selector);
  } catch (error) {
    console.log('Our Error: fetchInfo() failed.\n', error.message);
    result = 'Error';
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
      await page.goto(`https://www.indeed.com${internshipDropdown[0]}`)
      console.log('Filtering by internship tag...');
    } else {
      console.log('No internship tag.');
    }

    const data = [];
    let totalJobs = 0;

    let hasNext = true;

    while (hasNext === true) {

      await page.waitForSelector('div[class="jobsearch-SerpJobCard unifiedRow row result clickcard"]');
      const elements = await page.$$('div[class="jobsearch-SerpJobCard unifiedRow row result clickcard"]');

      console.log('Scraping Jobs:', elements.length);
      totalJobs += elements.length;

      // getting all job link for that page
      await page.waitForSelector('div[class="jobsearch-SerpJobCard unifiedRow row result clickcard"] h2.title a');
      const url = await page.evaluate(
          () => Array.from(
              // eslint-disable-next-line no-undef
              document.querySelectorAll('div[class="jobsearch-SerpJobCard unifiedRow row result clickcard"] h2.title a'),
              a => a.getAttribute('href'),
          ),
      );

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        await element.click();
        
        await page.waitForSelector('div[id="vjs-container"]');
        const position = await fetchInfo(page, 'div[id="vjs-jobtitle"]');
        let company = '';
        try {
          company = await fetchInfo(page, 'span[id="vjs-cn"]');

        } catch (err3) {
          console.log('Our Error:', err3.message);
        }
        const location = await fetchInfo(page, 'span[id="vjs-loc"]');
        const posted = await fetchInfo(page, 'div[class="result-link-bar"] span[class="date date-a11y"]');
        const description = await fetchInfo(page, 'div[id="vjs-desc"]');
        const lastScraped = new Date();
        const skills = 'N/A';

        let state = '';
        if (!location.match(/([^,]*)/g)[2]) {
          state = 'United States';
        } else {
          state = location.match(/([^,]*)/g)[2].trim();
        }

        data.push({
          position: position,
          company: company,
          location: {
            city: location.match(/([^,]*)/g)[0],
            state: state,
          },
          posted: posted,
          url: `https://www.indeed.com${url[i]}`,
          skills: skills,
          lastScraped: lastScraped,
          description: description,
        });

        console.log(position);
      }

      // keep clicking next until it reaches end
      try {
        await page.waitFor(1000);
        await page.click('li a[aria-label="Next"]');
      } catch (err4) {
        console.log('Reached the end of pages!');
        hasNext = false;
      }
    }

    // write results to JSON file
    await fs.writeFile('scrapers/data/canonical/indeed.canonical.data.json',
        JSON.stringify(data, null, 4), 'utf-8',
        err => (err ? console.log('\nData not written!', err) :
            console.log('\nData successfully written!')));

    console.log('Total internships scraped:', totalJobs);
    await browser.close();

  } catch (e) {
    console.log('Our Error:', e.message);
    await browser.close();
  }

})();
