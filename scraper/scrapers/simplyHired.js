/* eslint-disable no-console,no-undef,no-await-in-loop,no-loop-func,max-len */
// eslint-disable-next-line global-require
import puppeteer from 'puppeteer';
import fs from 'fs';
import { fetchInfo } from './scraperFunctions.js';

const myArgs = process.argv.slice(2);

(async () => {
  try {

    const browser = await puppeteer.launch({
      headless: false,
    });

    const page = await browser.newPage();

    // eslint-disable-next-line max-len
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');

    await page.goto('https://www.simplyhired.com/');
    await page.waitForSelector('input[name=q]');

    const searchQuery = myArgs.join(' ');

    await page.$eval('input[name=l]', (el) => el.value = '');
    await page.type('input[name=q]', searchQuery);
    await page.click('button[type="submit"]');

    console.log(`Inputted search query: ${searchQuery}`);

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
      console.log(`Directing to: ${url}`);
      await page.goto(url);

      await page.waitForSelector('div[data-id=JobType]');

      // Setting filter as last '7 days'
      const lastPosted = await page.evaluate(
          () => Array.from(
              // eslint-disable-next-line no-undef
              document.querySelectorAll('div[data-id=Date] a[href*="7"]'),
              a => a.getAttribute('href'),
          ),
      );

      const lastPostedURL = `https://www.simplyhired.com/${lastPosted[0]}`;
      console.log('Setting Date Relevance: 7 days');
      await page.goto(lastPostedURL);

      await page.waitFor(1000);
      await page.click('a[class=SortToggle]');
      console.log('Filtering by: Most recent');

      let hasNext = true;

      while (hasNext === true) {

        try {

          await page.waitForSelector('.SerpJob-jobCard.card');
          const elements = await page.$$('.SerpJob-jobCard.card');

          console.log('\n\nTotal results: ', elements.length);

          try {
            // Test to see which UI loads
            await page.evaluate(() => document.querySelector('.rpContent.ViewJob.ViewJob-redesign.ViewJob-v3').innerHTML);

            console.log('Loaded up with new UI... \n');

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


                  // page.evaluate(() => document.querySelector('.RightPane > aside h2 ').innerHTML);
              // const company = await page.evaluate(() => document.querySelector('.RightPane .viewjob-labelWithIcon').innerHTML);
              // const location = await page.evaluate(() => document.querySelector('.RightPane .viewjob-labelWithIcon:last-child').innerHTML);

              let qualifications = '';
              try {
                qualifications = await fetchInfo(page, '.viewjob-section.viewjob-qualifications.viewjob-entities ul', 'innerText');
                // qualifications = await page.evaluate(() => document.querySelector('.viewjob-section.viewjob-qualifications.viewjob-entities ul').innerHTML);
              } catch (err6) {
                console.log('Does not have qualifications section. Assigning it as N/A');
                skills = 'N/A';
              }

              const description = await fetchInfo(page, '.viewjob-jobDescription > div.p', 'innerHTML');
              let posted = '';

              try {
                posted = await fetchInfo(page, '.viewjob-labelWithIcon.viewjob-age span', 'innerText');
              } catch (err2) {
                posted = 'N/A';
                console.log('No date found. Setting posted as: N/A');
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
                console.log('Error in fetching link for:', position);
              }

              console.log(position);
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
            console.log('--- Loaded up old UI. Trying to scrape with old UI layout ---');

            try {

              await page.waitFor(1000);

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
                const elementLink = elements[i - 1];

                // await page.waitForSelector('.viewjob-header h1');
                // await page.waitForSelector('.viewjob-header span.company');
                // await page.waitForSelector('.viewjob-header span.location');
                // await page.waitForSelector('div.viewjob-description.ViewJob-description');

                // const position = await page.evaluate(() => document.querySelector('.viewjob-header h1').innerHTML);
                // const company = await page.evaluate(() => document.querySelector('.viewjob-header span.company').innerHTML);
                // const location = await page.evaluate(() => document.querySelector('.viewjob-header span.location').innerHTML);
                // const description = await page.evaluate(() => document.querySelector('div.viewjob-description.ViewJob-description').innerHTML);
                // let posted = '';

                const position = await fetchInfo(page, 'div[class="viewjob-jobTitle h2"]', 'innerText');
                const company = await fetchInfo(page, 'div[class="viewjob-header-companyInfo"] div:nth-child(1)', 'innerText');
                let location = await fetchInfo(page, 'div[class="viewjob-header-companyInfo"] div:nth-child(2)', 'innerText');
                const description = await fetchInfo(page, 'div[class="viewjob-jobDescription"]', 'innerHTML');

                let posted = '';
                try {
                  // posted = await page.evaluate(() => document.querySelector('.extra-info .info-unit i.far.fa-clock + span').innerHTML);
                  posted = await fetchInfo(page, 'span[class="viewjob-labelWithIcon viewjob-age"]', 'innerText');

                } catch (err4) {
                  posted = 'N/A';
                  console.log('No date found. Setting posted as: N/A');
                }

                // let savedURL = '';
                // try {
                //   const pageURL = await elementLink.$('.card-link');
                //   savedURL = await page.evaluate(span => span.getAttribute('href'), pageURL);
                // } catch (err6) {
                //   console.log('Error in fetching link for:', position);
                // }

                if (posted.includes('hours') || posted.includes('hour')) {
                  daysBack = 0;
                } else {
                  daysBack = posted.match(/\d+/g);
                }

                date.setDate(date.getDate() - daysBack);

                console.log(position);

                data.push({
                  position: position,
                  company: company,
                  location: {
                    city: location.match(/^([^,]*)/)[0],
                    state: location.match(/([^ ,]*)$/)[0],
                  },
                  posted: date,
                  url: allJobLinks[i-1],
                  lastScraped: lastScraped,
                  description: description,
                });
                totalJobs++;

                if (i < elements.length) {
                  await element.click();
                }
              }

            } catch (err) {
              console.log('InternBit Error: ', err.message);
            }
          }

          let nextPage = await page.$('a[class="Pagination-link next-pagination"]');
          await nextPage.click();
          totalPages++;

        } catch (err5) {
          console.log(err5.message);
          hasNext = false;
          console.log('\nReached the end of pages!');
        }

      }

      // write results to JSON file
      fs.writeFile('./data/canonical/simplyHired.canonical.data.json',
          JSON.stringify(data, null, 4), 'utf-8',
          err => (err ? console.log('\nData not written!', err) :
              console.log('\nData successfully written!')));

    } else {
      console.log(`There are no internships with the search query: ${searchQuery}`);
    }

    await browser.close();
    console.log('\nTotal Jobs Scraped:', totalJobs);
    console.log('Total Pages:', totalPages);
    console.log('\nClosing browser...');

  } catch (e) {
    console.log('Our Error: ', e.message);
  }

})();
