/* eslint-disable no-await-in-loop */
import puppeteer from 'puppeteer';
import fs from 'fs';
import { fetchInfo } from './scraperFunctions.js';
import userAgent from 'user-agents';

// const myArgs = process.argv.slice(2);


(async () => {

  const browser = await puppeteer.launch({
    headless: false,
  });

  try {

    const page = await browser.newPage();
    await page.setUserAgent(userAgent.toString());
    await page.setViewport({
      width: 1100, height: 700,
    });

    await page.goto('https://www.monster.com/jobs/search/?q=computer-science-intern&intcid=skr_navigation_nhpso_searchMain&tm=30');
    // await page.waitForSelector('input[id="q2"]');
    // await page.waitForSelector('button[id="doQuickSearch2"]');
    //
    // const searchQuery = myArgs.join(' ');

    // await page.type('input[id="q2"]', searchQuery);
    // await page.click('button[id="doQuickSearch2"]');
    //
    // await page.waitFor(3000);
    // await page.waitForSelector('button[id="filter-flyout"]');
    // await page.click('button[id="filter-flyout"]');
    //
    // await page.waitFor(1000);
    // await page.waitForSelector('select[id="FilterPosted"]');
    // await page.click('select[id="FilterPosted"]');
    //
    // await page.click('select[id="FilterPosted"]');
    //
    // await page.waitFor(2000);
    //
    // await page.waitForSelector('select[id="FilterPosted"] option[value="30"]');
    // await page.click('select[id="FilterPosted"] option[value="30"]');
    //
    // // await page.keyboard.press('ArrowDown');
    // // await page.keyboard.press('ArrowDown');
    // // await page.keyboard.press('ArrowDown');
    // // await page.keyboard.press('ArrowDown');
    // // await page.keyboard.press('ArrowDown');
    // // await page.keyboard.press('ArrowDown');  // <-- comment out this line if want to filter by '14' days
    // // await page.keyboard.press('Enter');
    // await page.click('button[id="use-filter-btn"]');
    //
    // console.log('Setting filter for 30 days...');

    let nextPage = true;

    while (nextPage === true) {
      try {
        await page.waitFor(2000);
        await page.waitForSelector('div[class="mux-search-results"]');
        await page.click('a[id="loadMoreJobs"]');
        console.log('Nagivating to next page....');
      } catch (e2) {
        console.log('Finished loading all pages.');
        nextPage = false;
      }
    }

    const elements = await page.$$('div[id="SearchResults"] section:not(.is-fenced-hide):not(.apas-ad)');

    // grabs all the posted dates
    const posted = await page.evaluate(
        () => Array.from(
            // eslint-disable-next-line no-undef
            document.querySelectorAll('section:not(.is-fenced-hide):not(.apas-ad) div[class="meta flex-col"] time'),
            a => a.textContent,
        ),
    );

    // grabs all position
    const position = await page.evaluate(
        () => Array.from(
            // eslint-disable-next-line no-undef
            document.querySelectorAll('div[id="SearchResults"] div.summary h2'),
            a => a.textContent,
        ),
    );

    // grabs all the company
    const company = await page.evaluate(
        () => Array.from(
            // eslint-disable-next-line no-undef
            document.querySelectorAll('div[id="SearchResults"] div.company span.name'),
            a => a.textContent,
        ),
    );

    const data = [];
    let totalJobs = 0;

    for (let i = 0; i < elements.length; i++) {
      const date = new Date();
      const lastScraped = new Date();
      const element = elements[i];
      await element.click();
      await page.waitForSelector('div[id="JobPreview"]');
      await page.waitFor(500);
      const location = await fetchInfo(page, 'div.heading h2.subtitle', 'innerText');
      const description = await fetchInfo(page, 'div[id="JobDescription"]', 'innerHTML');
      const url = await page.url();

      let daysToGoBack = 0;
      if (posted[i].includes('today')) {
        daysToGoBack = 0;
      } else {
        // getting just the number (eg. 1, 3, 20...)
        daysToGoBack = posted[i].match(/\d+/g);
      }

      // going backwards
      date.setDate(date.getDate() - daysToGoBack);

      let zip = location.match(/([^\D,])+/g);

      if (zip != null) {
        zip = zip[0];
      } else {
        zip = 'N/A';
      }

      data.push({
        position: position[i].trim(),
        company: company[i].trim(),
        location: {
          city: location.match(/^([^,]*)/g)[0],
          state: location.match(/([^,\d])+/g)[1].trim(),
          zip: zip,
        },
        url: url,
        posted: date,
        lastScraped: lastScraped,
        description: description.trim(),
      });

      await page.waitForSelector('div[id="JobPreview"]');

      totalJobs++;
    }

    // write results to JSON file
    await fs.writeFile('scrapers/data/canonical/monster.canonical.data.json',
        JSON.stringify(data, null, 4), 'utf-8',
        err => (err ? console.log('\nData not written!', err) :
            console.log('\nData successfully written!')));

    await console.log('Total internships scraped:', totalJobs);
    await browser.close();

  } catch (e) {
    console.log('Our Error:', e.message);
    await browser.close();
  }

})();
