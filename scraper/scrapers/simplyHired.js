import Logger from 'loglevel';
import puppeteer from 'puppeteer';
import fs from 'fs';
import { fetchInfo } from './scraperFunctions.js';

const myArgs = process.argv.slice(2);
async function main() {
  try {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');
    await page.goto('https://www.simplyhired.com/');
    await page.waitForSelector('input[name=q]');
    const searchQuery = myArgs.join(' ');
    await page.$eval('input[name=l]', (el) => {
      // eslint-disable-next-line no-param-reassign
      el.value = '';
    }, {});
    await page.type('input[name=q]', searchQuery);
    await page.click('button[type="submit"]');
    Logger.info(`Inputted search query: ${searchQuery}`);
    await page.waitForSelector('div[data-id=JobType]');
    // Getting href link for internship filter
    const internshipDropdown = await page.evaluate(
        () => Array.from(
            // eslint-disable-next-line no-undef
            document.querySelectorAll('a[href*="internship"]'),
            a => a.getAttribute('href'),
        ),
    );

    let totalPages = 1;
    let totalJobs = 0;
    const data = [];

    // check to see if internship tag exists
    if (internshipDropdown.length > 0) {
      const url = `https://www.simplyhired.com/${internshipDropdown[0]}`;
      Logger.info(`Directing to: ${url}`);
      await page.goto(url);
      await page.waitForSelector('div[data-id=JobType]');
      // Setting filter as last '7 days'
      const lastPosted = await page.evaluate(
          () => Array.from(
              document.querySelectorAll('div[data-id=Date] a[href*="7"]'),
              a => a.getAttribute('href'),
          ),
      );
      const lastPostedURL = `https://www.simplyhired.com/${lastPosted[0]}`;
      Logger.info('Setting Date Relevance: 7 days');
      await page.goto(lastPostedURL);
      await page.waitForTimeout(1000);
      await page.click('a[class=SortToggle]');
      Logger.info('Filtering by: Most recent');
      let hasNext = true;
      while (hasNext === true) {
        try {
          await page.waitForSelector('.SerpJob-jobCard.card');
          const elements = await page.$$('.SerpJob-jobCard.card');
          Logger.info('\n\nTotal results: ', elements.length);
          try {
            // Test to see which UI loads
            await page.evaluate(() => document.querySelector('.rpContent.ViewJob.ViewJob-redesign.ViewJob-v3').innerHTML);
            Logger.info('Loaded up with new UI... \n');
            await page.waitForSelector('.RightPane');
            await page.waitForSelector('h2.viewjob-jobTitle');
            await page.waitForSelector('.viewjob-labelWithIcon');
            for (let i = 1; i <= elements.length; i++) {
              const date = new Date();
              let daysBack = 0;
              const lastScraped = new Date();

              const element = elements[i];
              const elementLink = elements[i - 1];

              const position = await fetchInfo(page, '.RightPane > aside h2 ', 'innerText');
              const company = await fetchInfo(page, '.RightPane .viewjob-labelWithIcon', 'innerText');
              const location = await fetchInfo(page, '.RightPane .viewjob-labelWithIcon:last-child', 'innerText');
              let qualifications = '';
              try {
                qualifications = await fetchInfo(page, '.viewjob-section.viewjob-qualifications.viewjob-entities ul', 'innerText');
              } catch (err6) {
                Logger.trace('Does not have qualifications section. Assigning it as N/A');
                qualifications = 'N/A';
              }
              const description = await fetchInfo(page, '.viewjob-jobDescription > div.p', 'innerHTML');
              let posted = '';
              try {
                posted = await fetchInfo(page, '.viewjob-labelWithIcon.viewjob-age span', 'innerText');
              } catch (err2) {
                posted = 'N/A';
                Logger.trace('No date found. Setting posted as: N/A');
              }

              if (posted.includes('hours') || posted.includes('hour')) {
                daysBack = 0;
              } else {
                daysBack = posted.match(/\d+/g);
              }

              date.setDate(date.getDate() - daysBack);

              let savedURL = '';
              try {
                const pageURL = await elementLink.$('.card-link');
                savedURL = await page.evaluate(span => span.getAttribute('href'), pageURL);
              } catch (err6) {
                Logger.trace('Error in fetching link for:', position);
              }
              Logger.info(position);
              data.push({
                position: position,
                company: company,
                location: {
                  city: location.match(/^([^,]*)/)[0],
                  state: location.match(/([^ ,]*)$/)[0],
                },
                qualifications: qualifications,
                posted: date,
                url: `https://www.simplyhired.com${savedURL}`,
                lastScraped: lastScraped,
                description: description,
              });
              totalJobs++;

              if (i < elements.length) {
                await element.click();
              }
            }
          } catch (e) {
            Logger.debug('--- Loaded up old UI. Trying to scrape with old UI layout ---');
            try {
              await page.waitForTimeout(1000);
              const allJobLinks = await page.evaluate(
                  () => Array.from(
                      // eslint-disable-next-line no-undef
                      document.querySelectorAll('a[class="SerpJob-link card-link"]'),
                      a => a.href,
                  ),
              );

              for (let i = 1; i <= elements.length; i++) {
                const date = new Date();
                let daysBack = 0;
                const lastScraped = new Date();

                const element = elements[i];
                // const elementLink = elements[i - 1];

                const position = await fetchInfo(page, 'div[class="viewjob-jobTitle h2"]', 'innerText');
                const company = await fetchInfo(page, 'div[class="viewjob-header-companyInfo"] div:nth-child(1)', 'innerText');
                const location = await fetchInfo(page, 'div[class="viewjob-header-companyInfo"] div:nth-child(2)', 'innerText');
                const description = await fetchInfo(page, 'div[class="viewjob-jobDescription"]', 'innerHTML');
                let posted = '';
                try {
                  // posted = await page.evaluate(() => document.querySelector('.extra-info .info-unit i.far.fa-clock + span').innerHTML);
                  posted = await fetchInfo(page, 'span[class="viewjob-labelWithIcon viewjob-age"]', 'innerText');
                } catch (err4) {
                  posted = 'N/A';
                  Logger.trace('No date found. Setting posted as: N/A');
                }
                if (posted.includes('hours') || posted.includes('hour')) {
                  daysBack = 0;
                } else {
                  daysBack = posted.match(/\d+/g);
                }
                date.setDate(date.getDate() - daysBack);
                Logger.info(position);
                data.push({
                  position: position,
                  company: company,
                  location: {
                    city: location.match(/^([^,]*)/)[0],
                    state: location.match(/([^ ,]*)$/)[0],
                  },
                  posted: date,
                  url: allJobLinks[i - 1],
                  lastScraped: lastScraped,
                  description: description,
                });
                totalJobs++;
                if (i < elements.length) {
                  await element.click();
                }
              }
            } catch (err) {
              Logger.trace('InternBit Error: ', err.message);
            }
          }
          const nextPage = await page.$('a[class="Pagination-link next-pagination"]');
          await nextPage.click();
          totalPages++;
        } catch (err5) {
          Logger.trace(err5.message);
          hasNext = false;
          Logger.debug('\nReached the end of pages!');
        }
      }

      // write results to JSON file
      fs.writeFile('./data/canonical/simplyHired.canonical.data.json',
          JSON.stringify(data, null, 4), 'utf-8',
          err => (err ? Logger.trace('\nData not written!', err) :
              Logger.debug('\nData successfully written!')));

    } else {
      Logger.debug(`There are no internships with the search query: ${searchQuery}`);
    }

    await browser.close();
    Logger.debug('\nTotal Jobs Scraped:', totalJobs);
    Logger.debug('Total Pages:', totalPages);
    Logger.debug('\nClosing browser...');

  } catch (e) {
    Logger.trace('Our Error: ', e.message);
  }
}

main();