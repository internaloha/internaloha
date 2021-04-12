import puppeteer from 'puppeteer';
import fs from 'fs';
import Logger from 'loglevel';
import moment from 'moment';
import { autoScroll, convertPostedToDate, fetchInfo, writeToJSON } from './scraper-functions.js';

const USERNAME_SELECTOR = '#mat-input-0';
const PASSWORD_SELECTOR = '#mat-input-1';
const CTA_SELECTOR = '#login-submit-button > div.mat-button-ripple.mat-ripple';
const credentials = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const Search_SELECTOR = '#container-1 > core-sidebar > navbar > navbar-vertical-style-2 > div.navbar-content.fuse-navy-700.ps > core-navigation > div > div > div:nth-child(1) > core-nav-vertical-item:nth-child(2) > a';
const menu = '#container-2 > toolbar > mat-toolbar > div > div:nth-child(1) > button > div.mat-button-ripple.mat-ripple.mat-button-ripple-round';
const searchtab = '#container-2 > toolbar > mat-toolbar > div > div:nth-child(1) > student-search-bar > mat-form-field > div > div.mat-form-field-flex > div.mat-form-field-infix';
const enter = '#container-2 > toolbar > mat-toolbar > div > div:nth-child(1) > student-search-bar > mat-form-field > div > div.mat-form-field-flex > div.mat-form-field-prefix.ng-tns-c32-28.ng-star-inserted';

async function getData(page) {
  const results = [];
  for (let i = 0; i < 5; i++) {
    // title, category, deadlines, date, location
    results.push(fetchInfo(page, '#container-3 > content > student-search > div > div.content.container > div > div.search-content > opportunity-card.ng-tns-c30-83.ng-tns-c36-4.ng-trigger.ng-trigger-animate.ng-star-inserted > div > div.w-100-p > div.pb-12 > a', 'innerHTML'));
    results.push(fetchInfo(page, '#container-3 > content > student-search > div > div.content.container > div > div.search-content > opportunity-card.ng-tns-c30-83.ng-tns-c36-4.ng-trigger.ng-trigger-animate.ng-star-inserted > div > div.w-100-p > div.pb-8 > div:nth-child(1)', 'innerText'));
    results.push(fetchInfo(page, '#container-3 > content > student-search > div > div.content.container > div > div.search-content > opportunity-card.ng-tns-c30-83.ng-tns-c36-4.ng-trigger.ng-trigger-animate.ng-star-inserted > div > div.w-100-p > div.pb-8 > div:nth-child(2)', 'innerText'));
    results.push(fetchInfo(page, '#container-3 > content > student-search > div > div.content.container > div > div.search-content > opportunity-card.ng-tns-c30-83.ng-tns-c36-4.ng-trigger.ng-trigger-animate.ng-star-inserted > div > div.w-100-p > div.pb-8 > div:nth-child(3)', 'innerText'));
    results.push(fetchInfo(page, '#container-3 > content > student-search > div > div.content.container > div > div.search-content > opportunity-card.ng-tns-c30-83.ng-tns-c36-4.ng-trigger.ng-trigger-animate.ng-star-inserted > div > div.w-100-p > div.pb-8 > div:nth-child(4)', 'innerText'));
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
  Logger.error('Starting scraper studentOpportunityCenter at', moment().format('LT'));
  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1100, height: 900,
    });
    await page.setDefaultTimeout(0);
    await page.goto('https://app.studentopportunitycenter.com/auth/login');
    await page.click(USERNAME_SELECTOR);
    await page.keyboard.type(credentials.studentOpportunityCenter.user);
    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type(credentials.studentOpportunityCenter.password);
    await page.click(CTA_SELECTOR);
    await page.waitForNavigation();
    await page.click(menu);
    await page.click(Search_SELECTOR);
    await autoScroll(page);
    await page.click(searchtab);
    await page.keyboard.type('computer science internship');
    await page.click(enter);

    const elements = await page.$$('li[class="result-card job-result-card result-card--with-hover-state"]');

    // eslint-disable-next-line no-unused-vars
    const times = await page.evaluate(
        () => Array.from(
            // eslint-disable-next-line no-undef
            document.querySelectorAll('div.result-card__meta.job-result-card__meta time:last-child'),
            a => a.textContent,
        ),
    );

    const urls = await page.evaluate(
        () => Array.from(
            // eslint-disable-next-line no-undef
            document.querySelectorAll('div.pb-12 > a'),
            a => a.href,
        ),
    );
    // console.log(urls);
    // eslint-disable-next-line no-unused-vars
    let totalInternships = 0;
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      try {
        await page.waitForSelector('div[class="details-pane__content details-pane__content--show"]');
        const lastScraped = new Date();
        const [position, company, location, posted, description] = await getData(page);
        await convertPostedToDate(posted);
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
          url: urls[i],
          lastScraped: lastScraped,
          description: description,
        });
        Logger.debug(position);
        totalInternships++;
      } catch (err5) {
        Logger.trace(err5.message);
        Logger.trace('Skipping! Did not load...');
      }
      await element.click();
    }
    await writeToJSON(data, 'studentOpportunityCenter');
  } catch (e) {
    Logger.trace('Our Error: ', e.message);
  }
  Logger.error(`Elapsed time for studentOpportunityCenter: ${moment(startTime).fromNow(true)} | ${data.length} listings scraped `);
}

export default main;
