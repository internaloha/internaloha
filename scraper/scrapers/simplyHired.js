import Logger from 'loglevel';
import { fetchInfo, startBrowser, writeToJSON } from './scraperFunctions.js';

async function getData(page) {
  const results = [];
  for (let i = 0; i < 5; i++) {
    // get title, company, description, city, and state
    results.push(fetchInfo(page, 'h1[itemprop="title"]', 'innerText'));
    results.push(fetchInfo(page, 'div[class="arDetailCompany"]', 'innerText'));
    results.push(fetchInfo(page, 'div[itemprop="description"]', 'innerHTML'));
    results.push(fetchInfo(page, 'span[itemprop="addressLocality"]', 'innerText'));
    results.push(fetchInfo(page, 'span[itemprop="addressRegion"]', 'innerText'));
  }
  return Promise.all(results);
}

async function setSearchFilter(page) {
  try {
    await page.waitForSelector('input[id="searchview"]');
    await page.type('input[id="searchview"]', 'internship');
    await page.keyboard.press('Enter');
    await page.waitForSelector('button[id="locations-filter-acc"]');
    await page.click('button[id="locations-filter-acc"]');
    await page.waitForSelector('input[id="locations-filter-input"]');
    await page.click('input[id="locations-filter-input"]');
    // Separated 'United' and 'States' so that dropdown list comes out
    await page.type('input[id="locations-filter-input"]', 'United');
    await page.type('input[id="locations-filter-input"]', ' States');
  } catch (err2) {
    Logger.debug(err2.message);
  }
}

const myArgs = process.argv.slice(2);
async function main() {
  let browser;
  let page;
  const data = [];
  Logger.enableAll(); // this enables console logging. Will replace with CLI args later.
  try {
    Logger.info('Executing script...');
    [browser, page] = await startBrowser();
    await page.goto('https://www.simplyhired.com/');
    await setSearchFilter(page);
    await page.waitForSelector('input[name=q]');
    const searchQuery = myArgs.join(' ');
    await page.$eval('input[name=l]', (el) => {
      // eslint-disable-next-line no-param-reassign
      el.value = '';
    }, {});
    await page.type('input[name=q]', searchQuery);
    await page.click('button[type="submit"]');
    Logger.info(`Inputted search query: ${searchQuery}`);
    await page.waitForSelector('div[data-id=JobType]');
    // Getting href link for internship filter
    const internshipDropdown = await page.evaluate(
        () => Array.from(
            // eslint-disable-next-line no-undef
            document.querySelectorAll('a[href*="internship"]'),
            a => a.getAttribute('href'),
        ),
    );

    const totalPages = 1;
    const totalJobs = 0;

    // check to see if internship tag exists
    if (internshipDropdown.length > 0) {
      const url = `https://www.simplyhired.com/${internshipDropdown[0]}`;
      Logger.info(`Directing to: ${url}`);
      await page.goto(url);
      await page.waitForSelector('div[data-id=JobType]');
      // Setting filter as last '7 days'
      const lastPosted = await page.evaluate(
          () => Array.from(
              document.querySelectorAll('div[data-id=Date] a[href*="7"]'),
              a => a.getAttribute('href'),
          ),
      );
      const lastPostedURL = `https://www.simplyhired.com/${lastPosted[0]}`;
      Logger.info('Setting Date Relevance: 7 days');
      await page.goto(lastPostedURL);
      await page.waitForTimeout(1000);
      await page.click('a[class=SortToggle]');
      Logger.info('Filtering by: Most recent');
      await page.waitForNavigation;
      const hasNext = true;
      while (hasNext === true) {
        try {
          await page.waitForSelector('.SerpJob-jobCard.card');
          const elements = await page.$$('.SerpJob-jobCard.card');
          Logger.info('\n\nTotal results: ', elements.length);
            // Test to see which UI loads
            await page.evaluate(() => document.querySelector('.rpContent.ViewJob.ViewJob-redesign.ViewJob-v3').innerHTML);
            Logger.info('Loaded up with new UI... \n');
            await page.waitForSelector('.RightPane');
            await page.waitForSelector('h2.viewjob-jobTitle');
            await page.waitForSelector('.viewjob-labelWithIcon');
            for (let i = 1; i <= elements.length; i++) {
              const urls = await page.evaluate(() => {
                const urlFromWeb = document.querySelectorAll('h3 a');
                const urlList = [...urlFromWeb];
                // eslint-disable-next-line no-shadow
                return urlList.map(url => url.href);
              });
              // Iterate through all internship positions
              try {
                for (let j = 0; j < urls.length; j++) {
                  await page.goto(urls[j]);
                  const lastScraped = new Date();
                  const [position, company, description, city, state] = await getData(page);
                  data.push({
                    url: urls[j],
                    position: position,
                    company: company.trim(),
                    location: { city: city, state: state },
                    lastScraped: lastScraped,
                    description: description,
                  });
                }
              } catch (err1) {
                Logger.error(err1.message);
              }
            }
        } catch (e) {
          Logger.error(e.message);
        }
      }
    }
    Logger.debug('\nTotal Jobs Scraped:', totalJobs);
    Logger.debug('Total Pages:', totalPages);
    await writeToJSON(data, 'simplyHired');
  } catch (e) {
    Logger.trace('Our Error: ', e.message);
    Logger.debug('\nData successfully written!');
    await browser.close();
  }
}

main();
