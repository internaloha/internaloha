/* eslint-disable max-len,no-await-in-loop,no-console */
const puppeteer = require('puppeteer');
const fs = require('fs');

const scraperFunction = require('./scraperFunctions');

(async () => {

      const data = [];
      const browser = await puppeteer.launch({
        headless: false,
      });

      try {

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');
        await page.goto('https://www.linkedin.com/jobs/search?keywords=Computer%2BScience&location=United%2BStates&geoId=103644278&trk=public_jobs_jobs-search-bar_search-submit&f_TP=1%2C2%2C3%2C4&f_E=1&f_JT=I&redirect=false&position=1&pageNum=0');

        // await page.waitForSelector('input[aria-label="Search job titles or companies"]');
        // await page.type('input[aria-label="Search job titles or companies"]', 'computer science');
        //
        // await page.waitForSelector('button[data-searchbar-type="JOBS"]');
        // await page.click('button[data-searchbar-type="JOBS"]');
        //
        // await page.waitForSelector('input[aria-label="Location"]');
        // await page.type('input[aria-label="Location"]', 'United States');
        // await page.waitFor(500);
        // await page.keyboard.press('Enter');
        //
        // // filter for internships only
        // await page.waitForSelector('header.header');
        // await page.waitFor(1500);
        // await page.waitForSelector('button[data-tracking-control-name="public_jobs_JOB_TYPE-dropdown"]');
        // await page.click('button[data-tracking-control-name="public_jobs_JOB_TYPE-dropdown"]');
        // await page.waitForSelector('label[for="JOB_TYPE-3"]');
        // await page.click('label[for="JOB_TYPE-3"]');
        // await page.waitForSelector('button[data-tracking-control-name="f_JT-done-btn"]');
        // await page.click('button[data-tracking-control-name="f_JT-done-btn"]');
        // console.log('Filtering by internship tag...');
        //
        // // sort by most recent
        // await page.waitForSelector('header.header');
        // await page.waitFor(1500);
        // await page.waitForSelector('button[data-tracking-control-name="public_jobs_-dropdown"]');
        // await page.click('button[data-tracking-control-name="public_jobs_-dropdown"]');
        // await page.waitForSelector('label[for="-1"]');
        // await page.click('label[for="-1"]');
        // await page.waitForSelector('button[data-tracking-control-name="sortBy-done-btn"]');
        // await page.click('button[data-tracking-control-name="sortBy-done-btn"]');
        // console.log('Sorting by most recent...');
        //
        // // sort by posted within last month
        // await page.waitForSelector('header.header');
        // await page.waitFor(1500);
        // await page.waitForSelector('button[data-tracking-control-name="public_jobs_TIME_POSTED-dropdown"]');
        // await page.click('button[data-tracking-control-name="public_jobs_TIME_POSTED-dropdown"]');
        // await page.waitForSelector('label[for="TIME_POSTED-2"]');
        // await page.click('label[for="TIME_POSTED-2"]');
        // await page.waitForSelector('button[data-tracking-control-name="f_TP-done-btn"]');
        // await page.click('button[data-tracking-control-name="f_TP-done-btn"]');
        // console.log('Only showing results within past month...');
        //
        // // sort by experience - internship
        // try {
        //   await page.waitForSelector('header.header');
        //   await page.waitFor(1500);
        //   await page.waitForSelector('button[data-tracking-control-name="public_jobs_EXPERIENCE-dropdown"]');
        //   await page.click('button[data-tracking-control-name="public_jobs_EXPERIENCE-dropdown"]');
        //   await page.evaluate(() => {
        //     [...document.querySelectorAll('div[id="EXPERIENCE-dropdown"] label')]
        //         .find(element => element.textContent.includes('Internship')).click();
        //   });
        //   await page.waitForSelector('button[data-tracking-control-name="f_E-done-btn"]');
        //   await page.click('button[data-tracking-control-name="f_E-done-btn"]');
        //   console.log('Setting experience as "Internship"...');
        // } catch (err2) {
        //   console.log('Our error: Unable to filter by experience - Internship');
        //   console.log(err2.message);
        // }

        await page.waitForSelector('section.results__list');
        console.log('Fetching jobs...');
        await scraperFunction.autoScroll(page);

        let loadMore = true;
        let loadCount = 0;
        let totalInternships = 0;

        // Sometimes infinite scroll stops and switches to a "load more" button
        while (loadMore === true && loadCount <= 15) {
          try {
            await page.waitFor(1000);
            await page.click('button[data-tracking-control-name="infinite-scroller_show-more"]');
            loadCount++;
          } catch (e2) {
            loadMore = false;
            console.log('Finished loading...');
          }
        }

        const elements = await page.$$('li[class="result-card job-result-card result-card--with-hover-state"]');
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
                document.querySelectorAll('a.result-card__full-card-link'),
                a => a.href,
            ),
        );

        console.log('Total Listings:', elements.length);

        const skippedURLs = [];

        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const time = times[i];

          // sometimes clicking it doesn't show the panel, try/catch to allow it to keep going
          try {

            await page.waitForSelector('div[class="details-pane__content details-pane__content--show"]');
            const position = await scraperFunction.fetchInfo(page, 'h2.topcard__title', 'innerText');
            const company = await scraperFunction.fetchInfo(page, 'a[data-tracking-control-name="public_jobs_topcard_org_name" ]', 'innerText');
            const location = await scraperFunction.fetchInfo(page, 'span[class="topcard__flavor topcard__flavor--bullet"]', 'innerText');
            const description = await scraperFunction.fetchInfo(page, 'div[class="show-more-less-html__markup show-more-less-html__markup--clamp-after-5"]', 'innerHTML');

            const date = new Date();
            let daysBack = 0;
            const lastScraped = new Date();

            if (time.includes('hours') || (time.includes('hour')) || (time.includes('minute'))
                || (time.includes('minutes'))) {
              daysBack = 0;
            } else if ((time.includes('week')) || (time.includes('weeks'))) {
              daysBack = time.match(/\d+/g) * 7;
            } else {
              daysBack = time.match(/\d+/g);
            }

            date.setDate(date.getDate() - daysBack);

            const posted = date;

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

            console.log(position);

            totalInternships++;
          } catch (err5) {
            console.log(err5.message);
            console.log('Skipping! Did not load...');
            skippedURLs.push(urls[i]);
          }

          await element.click();
        }

        console.log('--- Going back to scrape the ones previously skipped ---');
        // scraping the ones we skipped
        for (let i = 0; i < skippedURLs.length; i++) {
          await page.goto(skippedURLs[i]);
          await page.waitForSelector('section.core-rail');

          const position = await scraperFunction.fetchInfo(page, 'h1.topcard__title', 'innerText');
          const company = await scraperFunction.fetchInfo(page, 'a[data-tracking-control-name="public_jobs_topcard_org_name"]', 'innerText');
          const location = await scraperFunction.fetchInfo(page, 'span[class="topcard__flavor topcard__flavor--bullet"]', 'innerText');
          const description = await scraperFunction.fetchInfo(page, 'div[class="show-more-less-html__markup show-more-less-html__markup--clamp-after-5"]', 'innerHTML');
          const time = await scraperFunction.fetchInfo(page, 'span.topcard__flavor--metadata.posted-time-ago__text', 'innerText');
          const skills = 'N/A';

          const date = new Date();
          let daysBack = 0;
          const lastScraped = new Date();

          if (time.includes('hours') || (time.includes('hour')) || (time.includes('minute'))
              || (time.includes('minutes'))) {
            daysBack = 0;
          } else if ((time.includes('week')) || (time.includes('weeks'))) {
            daysBack = time.match(/\d+/g) * 7;
          } else {
            daysBack = time.match(/\d+/g) * 30;
          }

          date.setDate(date.getDate() - daysBack);

          const posted = date;
          let state = '';

          if (!location.match(/([^,]*)/g)[2]) {
            state = 'United States';
          } else {
            state = location.match(/([^,]*)/g)[2].trim();
          }

          data.push({
            position: position,
            company: company.trim(),
            location: {
              city: location.match(/([^,]*)/g)[0].trim(),
              state: state.trim(),
            },
            posted: posted,
            url: skippedURLs[i],
            skills: skills,
            lastScraped: lastScraped,
            description: description,
          });

          console.log(position);
          totalInternships++;

        }

        console.log('Total internships scraped:', totalInternships);
        console.log('Closing browser!');
        await browser.close();

      } catch (e) {
        console.log('Our Error:', e.message);
        await browser.close();
      }

      // write results to JSON file
      await fs.writeFile('scrapers/data/canonical/linkedin.canonical.data.json',
          JSON.stringify(data, null, 4), 'utf-8',
          err => (err ? console.log('\nData not written!', err) :
              console.log('\nData successfully written!')));
    }
)();
