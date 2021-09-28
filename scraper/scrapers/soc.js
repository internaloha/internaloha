import Logger from 'loglevel';
import moment from 'moment';
import fs from 'fs';
import { fetchInfo, startBrowser, writeToJSON } from './scraper-functions.js';
import Scraper from '../components/Scraper.js';

/**
 * getData: Scrapes individual pages.
 * @param page
 * @returns {Promise<unknown[]>}
 */
async function getData(page) {
  const results = [];
  for (let i = 0; i < 6; i++) {
    // get title, company, description, city, state, and zip
    results.push(fetchInfo(page, '.opportunity-heading', 'innerHTML'));
    results.push('N/A');
    results.push(fetchInfo(page, '.opportunity-details', 'innerText'));
    // gets location and splits into city and state
    try {
      await page.waitForSelector('.pl-6');
      const labels = await page.evaluate(() => {
        const tags = document.querySelectorAll('.pl-6');
        const returnValues = [];
        tags.forEach((tag) => {
          returnValues.push(tag.innerHTML);
        });
        return returnValues;
      });
      const cleanLocation = labels[2].slice(29, labels[2].lastIndexOf(' '));
      const city = cleanLocation.slice(0, cleanLocation.indexOf(','));
      results.push(city);
      const state = cleanLocation.slice(cleanLocation.indexOf(',') + 2, cleanLocation.lastIndexOf(','));
      results.push(state);
    } catch (e) {
      results.push('N/A');
      results.push('N/A');
    }
  }
  return Promise.all(results);
}

class Soc extends Scraper {

  constructor(minimumListings, listingFilePath, statisticsFilePath) {
    super(
        'SOC: ',
        'https://app.studentopportunitycenter.com/auth/login',
        JSON.parse(fs.readFileSync('./config.json', 'utf8')),
    );
  }

  async mainScraper(headless) {
    let browser;
    let page;
    const data = [];
    const startTime = new Date();
    const credentialsUsername = this.credentials.studentOpportunityCenter.user;
    const credentialsPassword = this.credentials.studentOpportunityCenter.password;
    const usernameElements = 'input[id=mat-input-0]';
    const passwordElements = 'input[id=mat-input-1]';
    const loginButtonElements = '#login-submit-button';

    try {
      // Starting Scraper and navigating to page.
      Logger.error('Starting scraper studentOpportunityCenter at', moment().format('LT'));
      [browser, page] = await startBrowser(headless);
      await page.goto(this.url);

      // Logging in
      await page.reload();
      await this.login(page, credentialsUsername, credentialsPassword, usernameElements, passwordElements, loginButtonElements);
      await page.waitForNavigation({ timeout: 120000 });

      // Searching with keyphrase 'Computer Science Internship'
      await page.waitForTimeout(3000);
      await page.goto('https://app.studentopportunitycenter.com/app/search/');
      await page.waitForSelector('#mat-input-0');
      await page.click('#mat-input-0');
      await page.keyboard.type('Computer Science Internship');
      await page.keyboard.press('Enter');

      // Selecting the 'Internship' filter
      await page.waitForTimeout(3000);
      await page.click('.mat-select-value');
      await page.waitForTimeout(3000);
      await page.click('#mat-option-17');
      await page.click('#soc-custom-loading-screen');
      await page.waitForTimeout(5000);

      // Getting total number of internships
      await page.waitForSelector('.mat-paginator-range-label');
      const range = await page.evaluate(() => document.querySelector('div[class="mat-paginator-range-label"]').innerHTML);
      let totalInternships = range.toString();
      totalInternships = totalInternships.slice(totalInternships.indexOf('f') + 2, totalInternships.length);
      totalInternships = parseInt(totalInternships, 0);
      const pages = Math.floor(totalInternships / 20);

      // Grabbing all of the URLS
      let urls = [];
      for (let i = 0; i < pages; i++) {
        await page.waitForTimeout(5000);
        const pageUrls = await page.evaluate(() => {
          const urlFromWeb = document.querySelectorAll('.pb-12 a');
          const urlList = [...urlFromWeb];
          return urlList.map(url => url.href);
        });
        urls = urls.concat(pageUrls);
        await page.waitForSelector('.mat-paginator-navigation-next');
        await page.click('.mat-paginator-navigation-next');
      }

      // Iterating through all of the pages
      try {
        for (let j = 0; j < urls.length; j++) {
          await page.goto(urls[j]);
          const lastScraped = new Date();
          const [position, company, description, city, state] = await getData(page);
          data.push({
            url: urls[j],
            position: position,
            company: company.trim(),
            location: { city: city, state: state },
            lastScraped: lastScraped,
            description: description,
          });
        }
      } catch (err1) {
        Logger.error(this.name, err1.message);
      }

      await writeToJSON(data, 'soc');
      await browser.close();
    } catch (err2) {
      Logger.error(this.name, err2.message);
      await browser.close();
    }
    Logger.error(`Elapsed time for soc: ${moment(startTime).fromNow(true)} | ${data.length} listings scraped `);
  }
}

export default Soc;
