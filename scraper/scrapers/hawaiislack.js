import puppeteer from 'puppeteer';
import fs from 'fs';
import log from 'loglevel';
import { fetchInfo } from './scraper-functions.js';

async function setSearchFilters(page) {
  // Navigate to internship page
  await page.waitForSelector('input[id="search_keywords"]');
  // change to internship when not testing
  await page.type('input[id="search_keywords"]', 'specialist');
  await page.click('[class="search_submit"]');
}

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 900 });
  // eslint-disable-next-line max-len
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');
  log.enableAll();
  try {
    await page.goto('https://jobs.hawaiitech.com/');
    await setSearchFilters(page);
    await page.waitForTimeout(2000);
    const elements = await page.evaluate(() => Array.from(
            document.querySelectorAll('ul[class="job_listings"] > li > a'),
            a => `${a.getAttribute('href')}`,
        ));

    const data = [];
    // goes to each page
    // const expiredData = [];
    for (let i = 0; i < elements.length; i++) {
      await page.goto(elements[i]);
      try {
        const position = await fetchInfo(page, 'h1[class="entry-title"]', 'innerText');
        let company = '';
        try {
          company = await fetchInfo(page, 'p[class="name"] > strong', 'innerText');
        } catch (noCompany) {
          company = 'Unknown';
        }
        let posted = await fetchInfo(page, 'li[class="post-date meta-wrapper"] > span[class="meta-text"] > a', 'innerText');
        // console.log(posted);
        // ignores expired listings.
        const expired = await fetchInfo(page, 'div[class="job-manager-info"]', 'innerText');
        if (expired.includes('expired')) {
          posted = '';
          i++;
        }
        const description = await fetchInfo(page, 'div[class="job_description"]', 'innerHTML');
        // Formats date
        const date = new Date(posted).toISOString();
        const lastScraped = new Date();
        let location = '';
        try {
          location = await fetchInfo(page, 'li[class="location"] > a', 'innerText');
        } catch (noLocation) {
          location = '';
        }
        data.push({
          position: position.trim(),
          company: company.trim(),
          location: location.trim(),
          posted: date,
          url: elements[i],
          lastScraped: lastScraped,
          description: description.trim(),
        });
        log.info(position.trim());
      } catch (err) {
        log.trace(err.message);
        // log.trace('Listing expired, skipping');
        // expiredData.push(elements[i]);
      }
    }
    await fs.writeFile('./data/canonical/HawaiiSlack.canonical.data.json',
        JSON.stringify(data, null, 4), 'utf-8',
        err => (err ? log.warn('\nData not written!', err) :
            log.info('\nData successfully written!')));
    await browser.close();
  } catch (err) {
    log.warn('Our Error:', err.message);
    await browser.close();
  }
}
main();
