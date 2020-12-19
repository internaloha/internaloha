/* eslint-disable max-len,no-console,no-await-in-loop */

import puppeteer from 'puppeteer';
import fs from 'fs';
import performance from 'perf_hooks';
import { fetchInfo } from './scraperFunctions.js';
import userAgent from 'user-agents';

const myArgs = process.argv.slice(2);

function removeDuplicates(skills) {
  return [...new Set(skills)];
};

async function autoScroll(page) {

  await page.waitForSelector('span[class="JobsPage_jobFilterListHeaderCount__2z-Nc"]');
  const elementResult = await page.$('span[class="JobsPage_jobFilterListHeaderCount__2z-Nc"]');
  const totalResults = await page.evaluate(element => element.textContent, elementResult);

  let results = 0;

  const parsedNumber = totalResults.replace(',', '');
  const number = parseInt(parsedNumber, 10);
  let prevNum = 0;
  let stuck = 0;

  console.log('Total Results:', number);

  try {
    while ((results < number) && (stuck <= 5)) {
      await page.waitFor(2000);
      await page.hover('div[class="GridItem_gridItem__1MSIc GridItem_clearfix__4PbqP GridItem_clearfix__4PbqP"]:last-child');
      const elem = await page.$$('div[class="GridItem_gridItem__1MSIc GridItem_clearfix__4PbqP GridItem_clearfix__4PbqP"]');
      prevNum = results;
      results = elem.length;
      // console.log(`Prev num: ${prevNum} | Current: ${results}`);
      // sometimes it gets stuck on the same number. If it gets stuck more than 5 times, we exit
      if (prevNum === results) {
        stuck++;
        console.log('Got stuck on autoscrolling...');
      }
    }
    console.log('Finished Loading:', results);
  } catch (e) {
    console.log('Error autoscrolling:', e.message);
  }
}

(async () => {

  const timeStart = performance.now();

  const browser = await puppeteer.launch({
    headless: false,
  });

  try {

    const page = await browser.newPage();
    await page.setViewport({
      width: 1100, height: 900,
    });
    await page.setUserAgent(userAgent.toString());
    await page.goto('https://www.internships.com/app/search');

    const searchQuery = myArgs.join(' ');

    await page.waitForSelector('input[id="jobsSearchSidebar-keywords-input"]');
    await page.type('input[id="jobsSearchSidebar-keywords-input"]', searchQuery);
    await page.waitForTimeout(1000);

    // sort by date
    await page.waitForSelector('p.Menu_title__3xALk');
    await page.click('p.Menu_title__3xALk');
    await page.waitForSelector('ul[class="Menu_list__2x6Qo SortMenu_filterMenuList__26wPX"]:last-child');
    await page.click('ul[class="Menu_list__2x6Qo SortMenu_filterMenuList__26wPX"]:last-child');
    console.log('Sorting by date...');

    // sorting by Hawaii, can comment out
    await page.waitForSelector('input[placeholder="City, State, or ZIP Code"]');
    await page.type('input[placeholder="City, State, or ZIP Code"]', 'Hawaii');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(2000);
    await page.keyboard.press('Enter');

    // auto scroll to get all the listings
    const infiniteScroll = 'div[class="GridItem_gridItem__1MSIc GridItem_clearfix__4PbqP GridItem_clearfix__4PbqP"]';
    await page.waitForSelector(infiniteScroll);
    await page.waitForTimeout(2000);
    await autoScroll(page);

    await page.waitForSelector('div[class="GridItem_jobContent__ENwap"]');
    const target = await page.$$('div[class="GridItem_jobContent__ENwap"]');
    const totalJobs = target.length;
    const data = [];
    let finishedJobs = 0;
    let skipped = 0;
    console.log('Starting scraping:');

    // Grabs all the jobs
    for (let currentCounter = 0; currentCounter < totalJobs; currentCounter++) {

      await page.goto('https://www.internships.com/app/search?keywords=computer+science&position-types=internship&location=&context=seo&seo-mcid=33279397626109020301048056291448164886');
      await page.waitForSelector('div[class="GridItem_jobContent__ENwap"]');
      let elementLoaded = await page.$$('div[class="GridItem_jobContent__ENwap"]');

      // if job we want to click is not loaded
      if (currentCounter >= elementLoaded.length) {
        let reachedTotal = false;

        // keep clicking until it is loaded
        while (reachedTotal === false) {
          const elements = await page.$$('div[class="GridItem_jobContent__ENwap"]');
          if (elements.length <= currentCounter) {
            await page.waitForTimeout(500);
            await page.hover('div[class="GridItem_gridItem__1MSIc GridItem_clearfix__4PbqP GridItem_clearfix__4PbqP"]:last-child');
            elementLoaded = await page.$$('div[class="GridItem_jobContent__ENwap"]');
          } else {
            reachedTotal = true;
          }
        }
        console.log('Loading more data...');
      }

      console.log('Total elementLoaded:', elementLoaded.length);

      // sometimes a job doesn't load properly so put it in try/catch to allow rest of script to run
      try {
        const element = elementLoaded[currentCounter];
        await element.click();

        const position = await fetchInfo(page, 'h1[class="DesktopHeader_title__2ihuJ"]', 'innerText');
        let company = await fetchInfo(page, 'div[class="DesktopHeader_subTitleRow__yQeLl"] span', 'innerText');
        const location = await fetchInfo(page, 'span[class="DesktopHeader_subTitle__3k6XA DesktopHeader_location__3jiWp"]', 'innerText');
        const posted = await fetchInfo(page, 'p[class="DesktopHeader_postedDate__11t-5"]', 'innerText');
        const url = page.url();
        const description = await fetchInfo(page, 'div[class="ql-editor ql-snow ql-container ql-editor-display Body_rteText__U3_Ce"]', 'innerHTML');

        if (company === undefined) {
          company = 'N/A';
        }

        // let skills = '';
        // try {
        //   skills = await page.evaluate(
        //       () => Array.from(
        //           // eslint-disable-next-line no-undef
        //           document.querySelectorAll('#job-post-chosen-skills div[class="JobPostSkills.module__skillsContainer_2LUX-"] span'),
        //           a => a.textContent,
        //       ),
        //   );
        //
        //   if (skills.length === 0) {
        //     // console.log(' === Error: No skills field. Setting it as "N/A" === ');
        //     skills = 'N/A';
        //   } else {
        //     skills = removeDuplicates(skills);
        //   }
        // } catch (err3) {
        //   console.log('Error in getting skills:', err3.message);
        // }

        const date = new Date();
        let daysBack = 0;
        const lastScraped = new Date();

        if (posted.includes('day') || posted.includes('days')) {
          daysBack = 0;
        } else if (posted.includes('month') || (posted.includes('months'))) {
            // 'a month ago...'
            if (posted.includes('a')) {
              daysBack = 30;
            } else {
              daysBack = posted.match(/\d+/g) * 30;
            }
          } else {
            daysBack = posted.match(/\d+/g);
          }

        date.setDate(date.getDate() - daysBack);

        const time = date;
        let state = '';

        // if there is no state tag
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
          posted: time,
          url: url,
          lastScraped: lastScraped,
          description: description,
        });
        finishedJobs++;
        console.log(`${position} - ${currentCounter}`);
      } catch (err5) {
        skipped++;
        console.log('Error, skipping page:', err5.message);
      }

    }

    console.log('Total jobs:', finishedJobs);
    console.log('Total jobs skipped:', skipped);

    // write results to JSON file
    await fs.writeFile('./data/canonical/internships.canonical.data.json',
        JSON.stringify(data, null, 4), 'utf-8',
        err => (err ? console.log('\nData not written!', err) :
            console.log('\nData successfully written!')));

    const timeEnd = performance.now();
    console.log(`Total execution time: ${timeEnd - timeStart} ms.`);
    console.log('Closing browser!');
    await browser.close();

  } catch
      (e) {
    console.log('Our Error:', e.message);
    await browser.close();
  }

})();
