import Logger from 'loglevel';
import moment from 'moment';
import fs from 'fs';
import { fetchInfo, startBrowser, writeToJSON } from './scraper-functions.js';

const credentials = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

async function getData(page) {
  const results = [];
  for (let i = 0; i < 6; i++) {
    // get title, company, description, city, state, and zip
    results.push(fetchInfo(page, '.opportunity-heading', 'innerHTML'));
    results.push('N/A');
    results.push(fetchInfo(page, 'p', 'innerText'));
    try {
      const labels = await page.evaluate(() => {
        const tags = document.querySelectorAll('div .pl-6');
        const returnValues = [];
        tags.forEach((tag) => {
          returnValues.push(tag.innerHTML);
        });
        return returnValues;
      });
      console.log(labels[2]);
      results.push(labels);
    } catch (e) {
      console.log(e);
    }
    results.push('N/A');
    results.push('N/A');
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
    /*
    await page.click('#mat-input-0');
    await page.keyboard.type('Computer Science Internship');
    await page.keyboard.press('Enter');
    await page.waitForNavigation();
     */
    await page.waitForTimeout(3000);
    await page.goto('https://app.studentopportunitycenter.com/app/search/');
    await page.waitForSelector('#mat-input-0');
    await page.click('#mat-input-0');
    await page.keyboard.type('Computer Science Internship');
    await page.keyboard.press('Enter');

    await page.waitForTimeout(3000);
    await page.click('.mat-select-value');
    await page.waitForTimeout(3000);
    await page.click('#mat-option-17');
    await page.waitForTimeout(5000);
    const urls = await page.evaluate(() => {
      const urlFromWeb = document.querySelectorAll('.pb-12 a');
      const urlList = [...urlFromWeb];
      return urlList.map(url => url.href);
    });

    try {
      for (let j = 0; j < urls.length; j++) {
        await page.goto(urls[j]);
        const lastScraped = new Date();
        const [position, company, description, city, state, zip] = await getData(page);
        data.push({
          url: urls[j],
          position: position,
          company: company.trim(),
          location: { city: city, state: state, zip: zip },
          lastScraped: lastScraped,
          description: description,
        });
        console.log(data[j]);
      }
    } catch (err1) {
      Logger.error(scraperName, err1.message);
    }

    console.log(data);

    // await writeToJSON(data, 'soc');
    await browser.close();
  } catch (err2) {
    Logger.error(scraperName, err2.message);
    await browser.close();
  }
  Logger.error(`Elapsed time for soc: ${moment(startTime).fromNow(true)} | ${data.length} listings scraped `);
}

export default main;
