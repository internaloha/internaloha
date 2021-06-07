import Logger from 'loglevel';
import moment from 'moment';
import fs from 'fs';
import { fetchInfo, startBrowser, writeToJSON } from './scraper-functions.js';

const credentials = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

async function getData(page) {
  const results = [];
  for (let i = 0; i < 6; i++) {
    // get title, company, description, city, state, and zip
    results.push(fetchInfo(page, 'h1[itemprop="title"]', 'innerText'));
    results.push(fetchInfo(page, 'div[class="arDetailCompany"]', 'innerText'));
    results.push(fetchInfo(page, 'div[itemprop="description"]', 'innerHTML'));
    results.push(fetchInfo(page, 'span[itemprop="addressLocality"]', 'innerText'));
    results.push(fetchInfo(page, 'span[itemprop="addressRegion"]', 'innerText'));
    results.push(fetchInfo(page, 'span[itemprop="postalCode"]', 'innerText'));
  }
  return Promise.all(results);
}

export async function main(headless) {
  let browser;
  let page;
  const data = [];
  const scraperName = 'SOC: ';
  const startTime = new Date();
  try {
    Logger.error('Starting scraper studentOpportunityCenter at', moment().format('LT'));
    [browser, page] = await startBrowser(headless);
    await page.goto('https://app.studentopportunitycenter.com/auth/login');
    // Logging in
    await page.reload();
    await page.type('input[id=mat-input-0]', credentials.studentOpportunityCenter.user);
    await page.type('input[id=mat-input-1]', credentials.studentOpportunityCenter.password);
    await page.click('#login-submit-button');
    await page.waitForNavigation({ timeout: 120000 });

    // Searching with keyword 'computer science'
    await page.click('#mat-input-0');
    await page.keyboard.type('Computer Science Internship');
    await page.keyboard.press('Enter');
    await page.waitForNavigation();

    await page.reload();
    await page.waitForTimeout(3000);
    await page.click('.mat-select-value');
    await page.waitForTimeout(3000);
    await page.click('#mat-option-17');
    await page.waitForTimeout(5000);
    const urls = await page.evaluate(() => {
      const urlFromWeb = document.querySelectorAll('.pb-12 a');
      console.log(urlFromWeb);
      const urlList = [...urlFromWeb];
      return urlList.map(url => url.href);
    });
    console.log(urls);
    await page.waitForNavigation({ timeout: 120000 });

    await writeToJSON(data, 'acm');
    await browser.close();
  } catch (err2) {
    Logger.error(scraperName, err2.message);
    await browser.close();
  }
  Logger.error(`Elapsed time for acm: ${moment(startTime).fromNow(true)} | ${data.length} listings scraped `);
}

export default main;
