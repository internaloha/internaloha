import Logger from 'loglevel';
import { fetchInfo, startBrowser, writeToJSON } from './scraper-functions.js';

async function setSearchFilters(page) {
  // Navigate to internship page
  await page.waitForSelector('input[id="search_keywords"]');
  // change to internship when not testing
  await page.type('input[id="search_keywords"]', 'internship');
  await page.click('[class="search_submit"]');
}

async function main(headless) {
  let browser;
  let page;
  try {
    [browser, page] = await startBrowser(headless);
    await page.setViewport({ width: 1100, height: 900 });
    // eslint-disable-next-line max-len
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');
    await page.goto('https://jobs.hawaiitech.com/');
    await setSearchFilters(page);
    await page.waitForTimeout(2000);
    const elements = await page.evaluate(() => Array.from(
        document.querySelectorAll('ul[class="job_listings"] > li > a'),
        a => `${a.getAttribute('href')}`,
    ));
    const data = [];
    // goes to each page
    // const expiredData = [];
    for (let i = 0; i < elements.length; i++) {
      await page.goto(elements[i]);
      try {
        const position = await fetchInfo(page, 'h1[class="entry-title"]', 'innerText');
        let company = '';
        try {
          company = await fetchInfo(page, 'p[class="name"] > strong', 'innerText');
        } catch (noCompany) {
          company = 'Unknown';
        }
        let posted = await fetchInfo(page, 'li[class="post-date meta-wrapper"] > span[class="meta-text"] > a', 'innerText');
        // console.log(posted);
        // ignores expired listings.
        const expired = await fetchInfo(page, 'div[class="single_job_listing"] > div', 'innerText');
        if (expired.includes('expired')) {
          posted = '';
          i++;
        }
        const description = await fetchInfo(page, 'div[class="job_description"]', 'innerHTML');
        // Formats date
        const date = new Date(posted).toISOString();
        const lastScraped = new Date();
        let location = '';
        try {
          location = await fetchInfo(page, 'li[class="location"]', 'innerText');
        } catch (noLocation) {
          location = '';
        }
        data.push({
          position: position.trim(),
          company: company.trim(),
          location: {
            where: location.trim(),
            state: 'HI',
          },
          posted: date,
          url: elements[i],
          lastScraped: lastScraped,
          description: description.trim(),
        });
        Logger.info(position.trim());
      } catch (err) {
        Logger.trace(err.message);
        // Logger.trace('Listing expired, skipping');
        // expiredData.push(elements[i]);
      }
    }
    await writeToJSON(data, 'hawaiislack');
    await browser.close();
  } catch (err) {
    Logger.warn('Our Error:', err.message);
    await browser.close();
  }
}
export default main;
