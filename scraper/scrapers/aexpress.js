import puppeteer from 'puppeteer';
import fs from 'fs';
import { fetchInfo, autoScroll } from './scraperFunctions.js';

(async () =>{
  try {
    const data = [];
    const browser = await puppeteer.launch( {
      headless: false,
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');

    await page.goto('https://jobs.americanexpress.com/jobs');
    await page.setViewport({
      width: 1050,
      height: 800,
    });

    // Navigated to internship page
    await page.waitForSelector('input[id="keyword-search"]');
    await page.type('input[id="keyword-search"]', 'internship');

    await page.waitForSelector('input[id="location-search"]');
    await page.type('input[id="location-search"]', 'United States');
    await page.click('button[id="search-btn"]');

    await page.waitForSelector('mat-select[id="mat-select-3"]');
    await page.click('mat-select[id="mat-select-3"]');

    await page.waitForSelector('mat-option[id="mat-option-15"]');
    await page.click('mat-option[id="mat-option-15"]');

    await page.waitForSelector('mat-panel-title > p > a');
    const urls = await page.evaluate( () => Array.from(
        document.querySelectorAll('mat-panel-title > p > a'),
        a => a.href,
        ),
    );

    console.log(urls);

    const urlListLength = urls.length;
    try {
      for (let i = 0; i < urlListLength; i++) {
        await page.goto(urls[i]);

        const city = 'N/A';
        const state = 'N/A';
        const company = 'American Express';
        const contact = 'https://careers.americanexpress.com/';

        const position = await fetchInfo(page, 'h1[itemprop="title"]', 'innerText');
        console.log(position);

        const location = await fetchInfo(page, 'li[itemprop="jobLocation"]','innerText');
        console.log(location);

        const description = await fetchInfo(page, 'article[itemprop="description"]', 'innerHTML');
        console.log(description);

        data.push({
          position: position,
          company: company,
          contact: contact,
          url: urls[i],
          location: {
            city: city,
            state: state,
            country: location.trim(),
          },
          description: description,
        });
      }
    } catch (err1) {
      console.log(err1);
    }

    console.log(data);

    // write results to JSON file
    await fs.writeFile('./data/canonical/aexpress.canonical.data.json',
        JSON.stringify(data, null, 4), 'utf-8',
        // eslint-disable-next-line no-console
        err => (err ? console.log('\nData not written!', err) :
            // eslint-disable-next-line no-console
            console.log('\nData successfully written!')));

  } catch (e) {
    console.log(e);
  }
})();
