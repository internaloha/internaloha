/* eslint-disable no-console,no-undef,no-await-in-loop,no-loop-func */
// eslint-disable-next-line global-require
const puppeteer = require('puppeteer');
const fs = require('fs');

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

    const searchQuery = 'Computer Science';

    await page.$eval('input[name=l]', (el) => el.value = '');
    await page.$eval('input[name=q]', (el, text) => el.value = text, searchQuery);
    await page.click('button[type="submit"]');

    console.log(`Inputted search query: ${searchQuery}`);

    await page.waitForSelector('div[data-id=JobType]');

    await page.waitForSelector('div[data-id=JobType]');

    // Getting href link for internship filter
    const internshipDropdown = await page.evaluate(
        () => Array.from(
            // eslint-disable-next-line no-undef
            document.querySelectorAll('a[href*="internship"]'),
            a => a.getAttribute('href'),
        ),
    );

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

    await page.waitFor('.SerpJob-jobCard.card');

    let hasNext = true;
    let nextPage = await page.$('.next-pagination a');
    await nextPage.click();
    await page.waitForSelector('.next-pagination a');

    while (hasNext === true) {
      try {
        await page.waitForSelector(2000);
        nextPage = await page.$('.next-pagination a');
        await nextPage.click();
      } catch (err5) {
        hasNext = false;
        console.log('Reached end of pages');
      }

    }
 

  } catch (e) {
    console.log('Our Error: ', e.message);
  }

})();
