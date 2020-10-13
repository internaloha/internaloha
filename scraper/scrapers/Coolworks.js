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
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');

    await page.goto('https://www.coolworks.com/');
    await page.setViewport({
      width: 1200,
      height: 800,
    });

    // Directs to Categories Page
    await page.waitForSelector('a[href="/jobs-by/category"]');
    await page.click('a[href="/jobs-by/category"]');

    // Selects Internship Page
    await page.waitForSelector('div[class="link-box"] > a[href="/internships"');
    await page.click('div[class="link-box"] > a[href="/internships"');

    await page.waitForSelector('div[class="holder"] > div[class="top-meta"] > h4 a');
    const urls = await page.evaluate(() => {
      // eslint-disable-next-line no-undef
      const urlFromWeb = document.querySelectorAll('article[class="job-post-wide"] > div[class="holder"] > div[class="top-meta"] > h4 a');
      const urlList = [...urlFromWeb];
      return urlList.map(url => url.href);
    });
    console.log(urls);

    const urlListLength = urls.length;
    try {
      for (let i = 0; i < urlListLength; i++) {
        await page.goto(urls[i]);

        const lastScraped = new Date();

        const position = await fetchInfo(page, 'h3', 'innerText');
        console.log(position);

        const contact = await fetchInfo(page, 'div[class="widget contact-widget"] > ul > li[class="mail"] > a', 'innerText');
        console.log(contact);

        const company = await fetchInfo(page, 'strong[class="ttl"] > a', 'innerText');
        console.log(company);

        const posted = await fetchInfo(page, 'span[class="time"]', 'innerText');
        console.log(posted);

        const description = await fetchInfo(page, 'div[id="ad_copy"]', 'innerHTML');
        console.log(description);

        // eslint-disable-next-line no-undef
        const location = await fetchInfo(page, 'div[class="holder wide stacked"] > dl > dd', 'innerText');
        console.log(location);

        let state = '';

        if (!location.match(/([^,]*)/g)[2]) {
          state = 'United States';
        } else {
          state = location.match(/([^,]*)/g)[2].trim();
        }

        data.push({
          url: urls[i],
          position: position,
          company: company.trim(),
          contact: contact,
          posted: posted,
          lastScraped: lastScraped,
          location: {
            city: location.match(/([^,]*)/g)[0].trim(),
            state: state.trim(),
          },
          description: description.trim(),
        });

      }
    } catch (err1) {
      console.log(err1);
    }

    // eslint-disable-next-line no-console
    console.log(data);

    // write results to JSON file
    await fs.writeFile('./data/canonical/coolworks.canonical.data.json',
        JSON.stringify(data, null, 4), 'utf-8',
        // eslint-disable-next-line no-console
        err => (err ? console.log('\nData not written!', err) :
            // eslint-disable-next-line no-console
            console.log('\nData successfully written!')));

  } catch (e) {
    console.log(e);
    console.log('Error in scraper');
  }
})();
