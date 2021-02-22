import puppeteer from 'puppeteer';
import fs from 'fs';
import log from 'loglevel';
import { fetchInfo, isRemote } from './scraper-functions.js';

async function setSearchFilters(page) {
  // Navigate to internship page
  await page.waitForSelector('input[id="search_keywords"]');
  // change to internship when not testing
  await page.type('input[id="search_keywords"]', 'intern');
  // await page.waitForSelector('input[id="search_location"]');
  // await page.type('input[id="search_location"]', 'United States');
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
    // const text = await fetchInfo(page, 'span[class="description fc-light fs-body1"]', 'textContent');
    // const number = text.match(/\d+/gm);
    // log.trace('Internships found:', number[0]);
    // grab all links
    const elements = await page.evaluate(
        () => Array.from(
            // eslint-disable-next-line no-undef
            document.querySelectorAll('[class="post-269 job_listing type-job_listing status-publish has post-thumbnail hentry job-type-full-time"]'),
            a => `https://jobs.hawaiitech.com/${a.getAttribute('href')}`,
        ),
    );
            // document.querySelectorAll('ul[class="job_listings"]').length
    const data = [];
    // goes to each page
    for (let i = 0; i < elements.length; i++) {
      await page.goto(elements[i]);
      try {
        const position = await fetchInfo(page, 'div[class="job_description"] Title', 'innerText');
        let company = '';
        try {
          company = await fetchInfo(page, 'div[class="job_description"] Hiring Unit', 'innerText');
        } catch (noCompany) {
          company = 'Unknown';
        }
        const posted = await fetchInfo(page, 'ul[class="job_description"] Date Posted', 'innerText');
        const description = await fetchInfo(page, 'class="job_description" Duties and Responsbilities', 'innerHTML');
        const skills = await page.evaluate(
            () => Array.from(
                // eslint-disable-next-line no-undef
                document.querySelectorAll('section[class="mb32"]:nth-child(3) a'),
                a => a.textContent,
            ),
        );
        const date = new Date();
        let daysBack = 0;
        const lastScraped = new Date();
        if (posted.includes('yesterday')) {
          daysBack = 1;
        } else {
          daysBack = posted.match(/\d+/g);
        }
        date.setDate(date.getDate() - daysBack);
        let location = '';
        // let city = '';
        // let state = '';
        try {
          location = await fetchInfo(page, 'class="job_description" Location', 'innerText');
          // city = location.match(/([^ –\n][^,]*)/g)[0].trim();
          // state = location.match(/([^,]*)/g)[2].trim();
        } catch (noLocation) {
          location = '';
          // city = 'Unknown';
          // state = 'Unknown';
        }
        // eslint-disable-next-line no-unused-vars
        // let remote = false;
        // if (isRemote(position) || isRemote(city) || isRemote(description)
        //     || isRemote(city) || isRemote(state)) {
        //   remote = true;
        // }
        data.push({
          position: position.trim(),
          company: company.trim(),
          location: location.trim(),
          posted: date,
          url: elements[i],
          skills: skills,
          lastScraped: lastScraped,
          description: description.trim(),
        });
        log.info(position.trim());
      } catch (err) {
        log.warn('Our Error: ', err.message);
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
