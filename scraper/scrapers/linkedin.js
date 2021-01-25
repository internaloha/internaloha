import puppeteer from 'puppeteer';
import fs from 'fs';
import { fetchInfo, autoScroll } from './scraperFunctions.js';

async function main() {
  const data = [];
  const browser = await puppeteer.launch({
    headless: false,
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');
    await page.goto('https://www.linkedin.com/jobs/search?keywords=Computer%2BScience&location=United%2BStates&geoId=103644278&trk=public_jobs_jobs-search-bar_search-submit&f_TP=1%2C2%2C3%2C4&f_E=1&f_JT=I&redirect=false&position=1&pageNum=0');
    await page.waitForSelector('section.results__list');
    console.log('Fetching jobs...');
    await autoScroll(page);
    let loadMore = true;
    let loadCount = 0;
    let totalInternships = 0;
    // Sometimes infinite scroll stops and switches to a "load more" button
    while (loadMore === true && loadCount <= 15) {
      try {
        await page.waitForTimeout(1000);
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
        const position = await fetchInfo(page, 'h2.topcard__title', 'innerText');
        const company = await fetchInfo(page, 'a[data-tracking-control-name="public_jobs_topcard_org_name" ]', 'innerText');
        const location = await fetchInfo(page, 'span[class="topcard__flavor topcard__flavor--bullet"]', 'innerText');
        const description = await fetchInfo(page, 'div[class="show-more-less-html__markup show-more-less-html__markup--clamp-after-5"]', 'innerHTML');
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
      const position = await fetchInfo(page, 'h1.topcard__title', 'innerText');
      const company = await fetchInfo(page, 'a[data-tracking-control-name="public_jobs_topcard_org_name"]', 'innerText');
      const location = await fetchInfo(page, 'span[class="topcard__flavor topcard__flavor--bullet"]', 'innerText');
      const description = await fetchInfo(page, 'div[class="show-more-less-html__markup show-more-less-html__markup--clamp-after-5"]', 'innerHTML');
      const time = await fetchInfo(page, 'span.topcard__flavor--metadata.posted-time-ago__text', 'innerText');
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
  await fs.writeFile('./data/canonical/linkedin.canonical.data.json',
    JSON.stringify(data, null, 4), 'utf-8', err => (err ? console.log('\nData not written!', err) :
      console.log('\nData successfully written!')));
}

main();
