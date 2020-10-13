import puppeteer from 'puppeteer';
import fs from 'fs';
import { fetchInfo } from './scraperFunctions.js';

(async () => {
  try {
    const data = [];
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    // eslint-disable-next-line max-len
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');

    await page.goto('https://jobs.acm.org/jobs/results/title/Internship/United+States?normalizedCountry=US&radius=5&sort=scorelocation%20desc');
    await page.setViewport({
      width: 1200,
      height: 800,
    });

    await page.waitForNavigation;

    // for loop allows for multiple iterations of search tab
    for (let i = 2; i < 10; i++) {
      // Fetching all urls in page into a list
      // eslint-disable-next-line no-await-in-loop,no-loop-func
      const urls = await page.evaluate(() => {
        // eslint-disable-next-line no-undef
        const urlFromWeb = document.querySelectorAll('h3 a');
        const urlList = [...urlFromWeb];
        return urlList.map(url => url.href);
      });
      // eslint-disable-next-line no-console
      console.log(urls);

      // Iterating through all internship positions
      const urlsListLength = urls.length;
      try {
        for (let j = 0; j < urlsListLength; j++) {
          // eslint-disable-next-line no-await-in-loop
          await page.goto(urls[j]);

          const lastScraped = new Date();

          // eslint-disable-next-line no-await-in-loop
          const position = await fetchInfo(page, 'h1[itemprop="title"]', 'innerText');
          // eslint-disable-next-line no-console
          console.log(position);

          // eslint-disable-next-line no-await-in-loop
          const company = await fetchInfo(page, 'div[class="arDetailCompany"]', 'innerText');
          // eslint-disable-next-line no-console
          console.log(company);

          // eslint-disable-next-line no-await-in-loop
          const description = await fetchInfo(page, 'div[itemprop="description"]', 'innerHTML');
          // eslint-disable-next-line no-console
          console.log(description);

          // eslint-disable-next-line no-await-in-loop
          const city = await fetchInfo(page, 'span[itemprop="addressLocality"]','innerText');
          // eslint-disable-next-line no-console
          console.log(city);

          // eslint-disable-next-line no-await-in-loop
          const state = await fetchInfo(page, 'span[itemprop="addressRegion"]', 'innerText');
          // eslint-disable-next-line no-console
          console.log(state);

          // eslint-disable-next-line no-await-in-loop
          const zip = await fetchInfo(page, 'span[itemprop="postalCode"]', 'innerText');
          // eslint-disable-next-line no-console
          console.log(zip);

          data.push({
            url: urls[j],
            position: position,
            company: company.trim(),
            location: {
              city: city,
              state: state,
              zip: zip,
            },
            lastScraped: lastScraped,
            description: description,
          });
        }
      } catch (err1) {
        // eslint-disable-next-line no-console
        console.log('Something went wrong with the scraping');
        // eslint-disable-next-line no-console
        console.log(err1.message);
      }
      // Returns to original search url, but next tab
      // eslint-disable-next-line no-await-in-loop
      await page.goto(`https://jobs.acm.org/jobs/results/title/Internship/United+States?normalizedCountry=US&radius=5&sort=PostDate%20desc&page=${i}`);
    }

    // eslint-disable-next-line no-console
    console.log(data);

    // write results to JSON file
    await fs.writeFile('./data/canonical/acm.canonical.data.json',
        JSON.stringify(data, null, 4), 'utf-8',
        // eslint-disable-next-line no-console
        err => (err ? console.log('\nData not written!', err) :
            // eslint-disable-next-line no-console
            console.log('\nData successfully written!')));

  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e.message);
  }
})();
