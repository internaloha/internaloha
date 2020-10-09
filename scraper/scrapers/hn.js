import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  try {
    const data = [];
    const browser = await puppeteer.launch( {
      headless: false,
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');

    await page.goto('https://news.ycombinator.com/item?id=24651639');
    await page.setViewport({
      width: 1100,
      height: 800,
    });

    // Navigates through current amount of pages. Should update to loop for how many pages there are.
    for (let i = 0; i < 3; i++) {
      // Query searches all comments to prevent replies as well
      const comments = await page.evaluate( () =>
          Array.from(document.querySelectorAll('div[class="comment"]'),
              div => div.innerText,
          ),
      );

      for (let j = 0; j < comments.length; j++) {
        data.push(comments[j]);
      }

      await page.waitForSelector('a[class="morelink"]');
      await page.click('a[class="morelink"]');
    }

    console.log(data);

    // write results to JSON file
    await fs.writeFile('./data/canonical/hn.canonical.data.json',
        JSON.stringify(data, null, 4), 'utf-8',
        // eslint-disable-next-line no-console
        err => (err ? console.log('\nData not written!', err) :
            // eslint-disable-next-line no-console
            console.log('\nData successfully written!')));

  } catch (e) {
    console.log('Problem within the scraper');
    console.log(e);
  }
})();
