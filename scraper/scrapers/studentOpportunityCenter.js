import puppeteer from 'puppeteer';
import fs from 'fs';
import Logger from 'loglevel';
import moment from 'moment';
import { fetchInfo, writeToJSON } from './scraper-functions.js';

const USERNAME_SELECTOR = '#mat-input-0';
const PASSWORD_SELECTOR = '#mat-input-1';
const CTA_SELECTOR = '#login-submit-button > div.mat-button-ripple.mat-ripple';
const credentials = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

async function getData(page) {
  const results = [];
  for (let i = 0; i < 3; i++) {
    // get title, description,and website
    results.push(fetchInfo(page, 'span[class="opportunity-heading pr-6 open-sans ng-tns-c66-203 ng-star-inserted"]', 'innerText'));
    results.push(fetchInfo(page, 'span[class="pb-8 mat-body-1 wrap-text"]', 'innerText'));
    results.push(fetchInfo(page, 'button[class="ng-tns-c66-296 mat-stroked-button"]', 'innerHTML'));
    // results.push(fetchInfo(page, '', 'innerText'));
   // results.push(fetchInfo(page, '#container-3 > content > student-search > div > div.content.container > div > div.search-content > opportunity-card.ng-tns-c30-83.ng-tns-c36-4.ng-trigger.ng-trigger-animate.ng-star-inserted > div > div.w-100-p > div.pb-8 > div:nth-child(4)', 'innerText'));
  }
  return Promise.all(results);
}

export async function main() {
  // eslint-disable-next-line no-unused-vars
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
  });
  const data = [];
  const startTime = new Date();
  const scraperName = 'SOC: ';
  Logger.error('Starting scraper studentOpportunityCenter at', moment().format('LT'));
  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1100, height: 900,
    });
    await page.setDefaultTimeout(100000);
    await page.goto('https://app.studentopportunitycenter.com/auth/login');
    await page.click(USERNAME_SELECTOR);
    await page.keyboard.type(credentials.studentOpportunityCenter.user);
    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type(credentials.studentOpportunityCenter.password);
    await page.click(CTA_SELECTOR);
    // await page.setDefaultNavigationTimeout(200000);
    // await page.waitForNavigation();
    await page.waitForTimeout(70000);
    await page.waitForNavigation();
    await page.click('input[aria-label="Search Bar"]');
    await page.keyboard.type('computer science internship');
    await page.keyboard.press('Enter');

    // const elements = await page.$$('li[class="result-card job-result-card result-card--with-hover-state"]');
    const urls = await page.$$('li[class="result-card job-result-card result-card--with-hover-state"]');

    // eslint-disable-next-line no-unused-vars
   const times = await page.evaluate(
        () => Array.from(
            // eslint-disable-next-line no-undef
            document.querySelectorAll('div.result-card__meta.job-result-card__meta time:last-child'),
            a => a.textContent,
        ),
    );

    /** const urls = await page.evaluate(
        () => Array.from(
            // eslint-disable-next-line no-undef
           document.querySelectorAll('div.pb-12 > a'),
            a => a.href,
        ),
    );* */
    console.log(urls);
    // eslint-disable-next-line no-unused-vars
    let totalInternships = 0;
    for (let i = 0; i < urls.length; i++) {
      // eslint-disable-next-line no-shadow
      const urls = await page.evaluate(
          () => Array.from(
              // eslint-disable-next-line no-undef
              document.querySelectorAll('div.pb-12 > a'),
              a => a.href,
          ),
      );
      // const element = elements[i];
      try {
        await page.waitForSelector('div[class="details-pane__content details-pane__content--show"]');
        const lastScraped = new Date();
        // eslint-disable-next-line no-unused-vars
        const [position, description, website] = await getData(page);
        // await convertPostedToDate(posted);
        const state = '';
        /** if (!location.match(/([^,]*)/g)[2]) {
          state = 'United States';
        } else {
          state = location.match(/([^,]*)/g)[2].trim();
        } * */
        data.push({
          position: position,
          company: website,
          location: {
            // city: location.match(/([^,]*)/g)[0],
            state: state,
          },
          // posted: posted,
          url: urls[i],
          lastScraped: lastScraped,
          description: description,
        });
        Logger.debug(position);
        totalInternships++;
      } catch (err5) {
        Logger.trace(scraperName, err5.message);
        Logger.trace('Skipping! Did not load...');
      }
      // await element.click();
      await urls.click();
    }
    await writeToJSON(data, 'studentOpportunityCenter');
  } catch (e) {
    Logger.trace(scraperName, 'Error: ', e.message);
  }
  Logger.error(`Elapsed time for studentOpportunityCenter: ${moment(startTime).fromNow(true)} | ${data.length} listings scraped `);
}

export default main;
