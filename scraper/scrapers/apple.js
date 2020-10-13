import puppeteer from 'puppeteer';
import fs from 'fs';
import { fetchInfo } from './scraperFunctions.js';

//Method to add delay time (waitFor function deprecated)
function delay(time) {
  return new Promise(function(resolve) {
    setTimeout(resolve, time)
  });
}

(async () => {
  try {
    const data = [];
    const browser = await puppeteer.launch( {
      headless: false,
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');

    await page.goto('https://jobs.apple.com/en-us/search?sort=relevance');
    await page.setViewport({
      width: 1100,
      height: 800,
    });

    await page.waitForSelector('input[role="combobox"]');
    await page.type('input[role="combobox"]', 'internship');
    await page.keyboard.press('Enter');

    await page.waitForSelector('button[id="locations-filter-acc"]');
    await page.click('button[id="locations-filter-acc"]');

    await page.waitForSelector('input[id="locations-filter-input"]');
    await page.click('input[id="locations-filter-input"]');

    // Separated 'United' and 'States' so that dropdown list comes out
    await page.type('input[id="locations-filter-input"]', 'United');
    await page.type('input[id="locations-filter-input"]', ' States');
    await delay(2000);

    // Delay prevents code from bypassing page changes
    await page.waitForSelector('li[id="locations-filter-input-option-1"]');
    await page.click('li[id="locations-filter-input-option-1"]');
    await delay(5000);

    // For loop to navigate the current two search pages, should change to fit any page size
    for (let i = 2; i < 4; i++) {

      await page.waitForSelector('a[class="table--advanced-search__title"]');
      let urls = await page.evaluate( () =>
          Array.from(document.querySelectorAll('a[class="table--advanced-search__title"]'),
              a => a.href,
          ),
      );
      console.log(urls);
      const urlList = urls.length;

      for (let j = 0; j < urlList; j++) {

        await page.goto(urls[j]);

        const lastScraped = new Date();

        const position = await fetchInfo(page, 'h1[itemprop="title"]', 'innerText');
        console.log(position);

        const posted = await fetchInfo(page, 'time[id="jobPostDate"]', 'innerText');
        console.log(posted);

        const description = await fetchInfo(page, 'div[id="jd-description"]', 'innerHTML');
        console.log(description);

        const city = await fetchInfo(page, 'span[itemprop="addressLocality"]','innerText');
        console.log(city);

        const state = await fetchInfo(page, 'span[itemprop="addressRegion"]','innerText');
        console.log(state);

        data.push({
          url: urls[j],
          position: position,
          posted: posted,
          lastScraped: lastScraped,
          location: {
            city: city,
            state: state,
          },
          description: description,

        });
      }
      //Uses i value in for loop to navigate search pages
      await page.goto(`https://jobs.apple.com/en-us/search?search=internship&sort=relevance&location=united-states-USA&page=${i}`);
    }

    console.log(data);

    // write results to JSON file
    await fs.writeFile('./data/canonical/apple.canonical.data.json',
        JSON.stringify(data, null, 4), 'utf-8',
        // eslint-disable-next-line no-console
        err => (err ? console.log('\nData not written!', err) :
            // eslint-disable-next-line no-console
            console.log('\nData successfully written!')));

await page.close();

  } catch (e) {
    console.log(e);
  }
})();
