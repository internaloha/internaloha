import puppeteer from 'puppeteer';
import log from 'loglevel';
import userAgent from 'user-agents';
import moment from 'moment';
import { fetchInfo, writeToJSON } from './scraper-functions.js';

async function autoScroll(page) {
  await page.waitForSelector('span[class="JobsPage_jobFilterListHeaderCount__2z-Nc"]');
  const elementResult = await page.$('span[class="JobsPage_jobFilterListHeaderCount__2z-Nc"]');
  const totalResults = await page.evaluate(element => element.textContent, elementResult);
  let results = 0;
  const parsedNumber = totalResults.replace(',', '');
  const number = parseInt(parsedNumber, 10);
  let prevNum = 0;
  let stuck = 0;
  log.info('Total Results:', number);
  try {
    while ((results < number) && (stuck <= 5)) {
      await page.hover('div[class="GridItem_gridItem__1MSIc GridItem_clearfix__4PbqP GridItem_clearfix__4PbqP"]:last-child');
      const elem = await page.$$('div[class="GridItem_gridItem__1MSIc GridItem_clearfix__4PbqP GridItem_clearfix__4PbqP"]');
      prevNum = results;
      results = elem.length;
      // sometimes it gets stuck on the same number. If it gets stuck more than 5 times, we exit
      if (prevNum === results) {
        stuck++;
        log.error('Got stuck on autoscrolling...');
      }
    }
    log.info('Finished Loading:', results);
  } catch (e) {
    log.error('Error autoscrolling:', e.message);
  }
}

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
  });
  const startTime = new Date();
  const data = [];
  log.error('Starting scraper internships (chegg) at', moment().format('LT'));
  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1100, height: 900,
    });
    await page.setDefaultTimeout(60000);
    await log.enableAll();
    await page.setUserAgent(userAgent.toString());
    await page.goto('https://www.internships.com/app/search');
    await page.waitForSelector('input[id="jobsSearchSidebar-keywords-input"]', { timeout: 0 });
    await page.type('input[id="jobsSearchSidebar-keywords-input"]', 'computer science');
    await page.waitForTimeout(1000);
    // sort by date
    await page.waitForSelector('p.Menu_title__3xALk');
    await page.click('p.Menu_title__3xALk');
    await page.waitForSelector('ul[class="Menu_list__2x6Qo SortMenu_filterMenuList__26wPX"]:last-child');
    await page.click('ul[class="Menu_list__2x6Qo SortMenu_filterMenuList__26wPX"]:last-child');
    log.info('Sorting by date...');
    // sorting by Hawaii, can comment out
    await page.waitForSelector('input[placeholder="City, State, or ZIP Code"]');
    await page.type('input[placeholder="City, State, or ZIP Code"]', 'Hawaii');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(2000);
    await page.keyboard.press('Enter');
    // remove unpaid listings
    await page.waitForSelector('div[data-test-id="jobsSearchSidebar-unpaid-checkbox-click"]');
    await page.click('div[data-test-id="jobsSearchSidebar-unpaid-checkbox-click"]');
    // auto scroll to get all the listings
    const infiniteScroll = 'div[class="GridItem_gridItem__1MSIc GridItem_clearfix__4PbqP GridItem_clearfix__4PbqP"]';
    await page.waitForSelector(infiniteScroll);
    await page.waitForTimeout(2000);
    await autoScroll(page);
    await page.waitForSelector('div[class="GridItem_jobContent__ENwap"]');
    const target = await page.$$('div[class="GridItem_jobContent__ENwap"]');
    const totalJobs = target.length;
    let finishedJobs = 0;
    let skipped = 0;
    log.info('Starting scraping:');
    // Grabs all the jobs
    for (let currentCounter = 0; currentCounter < totalJobs; currentCounter++) {
      await page.goto('https://www.internships.com/app/search?keywords=computer+science&position-types=internship&location=Hawaii&context=seo&seo-mcid=33279397626109020301048056291448164886');
      // uncheck unpaid listing
      await page.waitForSelector('div[data-test-id="jobsSearchSidebar-unpaid-checkbox-click"]');
      await page.click('div[data-test-id="jobsSearchSidebar-unpaid-checkbox-click"]');
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
        log.info('Loading more data...');
      }
      log.info('Total elementLoaded:', elementLoaded.length);
      // sometimes a job doesn't load properly so put it in try/catch to allow rest of script to run
      try {
        const element = elementLoaded[currentCounter];
        await element.click();
        let [position, company, location, posted, description] = '';
        try {
          position = document.querySelector('h1[class="DesktopHeader_title__2ihuJ"]');
          if (position !== null) {
            position = await fetchInfo(page, 'h1[class="DesktopHeader_title__2ihuJ"]', 'innerText');
          } else {
            position = 'N/A';
          }
        } catch (e) {
          log.error('Something went wrong with position selector', e.message);
        }
        try {
          company = document.querySelector('h1[class="DesktopHeader_title__2ihuJ"]');
          if (company !== null) {
            company = await fetchInfo(page, 'div[class="DesktopHeader_subTitleRow__yQeLl"] span', 'innerText');
          } else {
            company = 'N/A';
          }
        } catch (e) {
          log.error('Something went wrong with company selector', e.message);
        }
        try {
          location = document.querySelector('span[class="DesktopHeader_subTitle__3k6XA DesktopHeader_location__3jiWp"]');
          if (location !== null) {
            location = await fetchInfo(page, 'span[class="DesktopHeader_subTitle__3k6XA DesktopHeader_location__3jiWp"]', 'innerText');
          } else {
            location = 'N/A';
          }
        } catch (e) {
          log.error('Something went wrong with location selector', e.message);
        }
        try {
          posted = document.querySelector('p[class="DesktopHeader_postedDate__11t-5"]');
          if (posted !== null) {
            posted = await fetchInfo(page, 'p[class="DesktopHeader_postedDate__11t-5"]', 'innerText');
          } else {
            posted = 'N/A';
          }
        } catch (e) {
          log.error('Something went wrong with company selector', e.message);
        }
        try {
          description = document.querySelector('div[class="ql-editor ql-snow ql-container ql-editor-display Body_rteText__U3_Ce"]');
          if (description !== null) {
            description = await fetchInfo(page, 'div[class="ql-editor ql-snow ql-container ql-editor-display Body_rteText__U3_Ce"]', 'innerHTML');
          } else {
            description = 'N/A';
          }
        } catch (e) {
          log.error('Something went wrong with description selector', e.message);
        }
        const url = page.url();
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
        log.info(`${position} - ${currentCounter}`);
      } catch (err5) {
        skipped++;
        log.error('Error, skipping page:', err5.message);
      }
    }
    log.info('Total jobs:', finishedJobs);
    log.info('Total jobs skipped:', skipped);
    // write results to JSON file
    await writeToJSON(data, 'internships');
    await browser.close();
  } catch
    (e) {
    log.error('Our Error:', e.message);
    await browser.close();
  }
  log.error(`Elapsed time for internships (Chegg): ${moment(startTime).fromNow(true)} | ${data.length} listings scraped `);
}

export default main;
