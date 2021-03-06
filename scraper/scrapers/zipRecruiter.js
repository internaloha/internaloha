import Logger from 'loglevel';
import moment from 'moment';
import { fetchInfo, startBrowser, writeToJSON, autoScroll } from './scraper-functions.js';

async function getData(page) {
  const results = [];
  for (let i = 0; i < 5; i++) {
    results.push(fetchInfo(page, '.job_title', 'innerText'));
    results.push(fetchInfo(page, '.hiring_company_text.t_company_name', 'innerText'));
    results.push(fetchInfo(page, 'span[data-name="address"]', 'innerText'));
    results.push(fetchInfo(page, '.jobDescriptionSection', 'innerHTML'));
    results.push(fetchInfo(page, '.job_more span[class="data"]', 'innerText'));
  }
  return Promise.all(results);
}

async function main(headless) {
  let browser;
  let page;
  const data = [];
  const startTime = new Date();
  const scraperName = 'Zip: ';
  try {
    Logger.error('Starting scraper zipRecruiter at', moment().format('LT'));
    [browser, page] = await startBrowser(headless);
    // await page.goto('https://www.ziprecruiter.com/candidate/search?search=computer+science+internship&location=United+States&days=10&radius=25&refine_by_salary=&refine_by_tags=&refine_by_title=&refine_by_org_name=');
    await page.goto('https://www.ziprecruiter.com/');
    await page.waitForSelector('input[id="search1"]');
    await page.waitForSelector('input[id="location1"]');
    const searchQuery = 'computer science internship';
    Logger.info('Inputting search query:', searchQuery);
    await page.type('input[id="search1"', searchQuery);
    // eslint-disable-next-line no-param-reassign,no-return-assign
    await page.$eval('input[id="location1"]', (el) => el.value = 'US');
    await page.click('button.job_search_hide + input');
    await page.mouse.click(1, 1);
    await page.waitForSelector('.modal-dialog');
    await page.mouse.click(1000, 800);
    await page.waitForTimeout(5000);
    Logger.info('Setting filter by 10 days...');
    await page.click('menu[id="select-menu-search_filters_days"]');
    await page.click('button[class="select-menu-header"]');
    await page.click('.select-menu-item:nth-child(3)');
    // Logger.info('Setting filter by any distance...');
    // await page.click('menu[id="select-menu-search_filters_radius"]');
    // await page.click('.select-menu-item:nth-child(6)');
    await page.waitForTimeout(5000);
    Logger.info('Setting filter based on internship tag...');
    await page.click('menu[id="select-menu-search_filters_tags"] > button[class="select-menu-header"]');
    await page.click('menu[id="select-menu-search_filters_tags"] .select-menu-item:nth-child(3)');
    await page.waitForSelector('.job_content');
    try {
      // Click the "Load More" button
      await page.click('.load_more_jobs');
      await autoScroll(page);
    } catch (err) {
      Logger.info(scraperName, '--- All jobs are Listed, no "Load More" button --- ');
    }
    // grab all links
    const elements = await page.evaluate(
        () => Array.from(
            // eslint-disable-next-line no-undef
            document.querySelectorAll('.job_link.t_job_link'),
            a => a.getAttribute('href'),
        ),
    );
    const skippedPages = [];
    let jobs = 0;
    Logger.info(elements.length);
    for (let i = 0; i < elements.length; i++) {
      try {
        const element = elements[i];
        // waits until page has loaded
        await page.goto(element, { waitUntil: 'domcontentloaded' });
        const currentPage = page.url();
        /* Checks to see if redirect is still within ZipRecruiter domain.
         * If it is within domain, we can continue scraping. If not, we don't scape the information
         * and add it to an array of pages skipped.
         */
        if (currentPage.startsWith('https://www.ziprecruiter.com')) {
          // console.log('Stay on same page:\n', currentPage);
          await page.waitForSelector('.pc_message');
          await page.click('.pc_message');
          const date = new Date();
          let daysBack = 0;
          const lastScraped = new Date();
          const [position, company, location, description, posted] = await getData(page);
          if (posted.includes('yesterday')) {
            daysBack = 1;
          } else {
            daysBack = posted.match(/\d+/g);
          }
          date.setDate(date.getDate() - daysBack);
          data.push({
            position: position.trim(),
            company: company.trim(),
            location: {
              city: location.match(/([^,]*)/g)[0].trim(),
              state: location.match(/([^,]*)/g)[2].trim(),
              country: location.match(/([^,]*)/g)[4].trim(),
            },
            url: currentPage,
            posted: date,
            lastScraped: lastScraped,
            description: description.trim(),
          });
          jobs++;
        } else {
          Logger.trace('--- Went off of ZipRecruiter, skipping ---');
          skippedPages.push(currentPage);
        }
      } catch (err4) {
        Logger.warn(scraperName, 'Error fetching link, skipping');
      }
    }
    // write results to JSON file
    await writeToJSON(data, 'ziprecruiter');
    Logger.info('Total jobs scraped:', jobs);
    Logger.info('Total links skipped:', skippedPages.length);
    Logger.info('Links skipped:', skippedPages);
    Logger.info('Closing browser...');
    await browser.close();
  } catch (e) {
    Logger.warn(scraperName, 'Error: ', e.message);
    await browser.close();
  }
  Logger.error(`Elapsed time for zipRecruiter: ${moment(startTime).fromNow(true)} | ${data.length} listings scraped `);
}

export default main;
