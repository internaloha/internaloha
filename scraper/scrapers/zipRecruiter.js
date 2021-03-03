import Logger from 'loglevel';
import { fetchInfo, startBrowser, writeToJSON, autoScroll, checkHeadlessOrNot } from './scraper-functions.js';

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
  try {
    Logger.debug('Executing script for zip...');
    [browser, page] = await startBrowser(headless);
    await page.goto('https://www.ziprecruiter.com/candidate/search?search=Internship&location=Honolulu%2C+HI&days=30&radius=5000&refine_by_salary=&refine_by_tags=&refine_by_title=Software+Engineering+Intern&refine_by_org_name=');
    await page.waitForSelector('input[id="search1"]');
    await page.waitForSelector('input[id="location1"]');
    const searchQuery = 'computer science intern';
    Logger.info('Inputting search query:', searchQuery);
    await page.type('input[id="search1"', searchQuery);
    // eslint-disable-next-line no-param-reassign,no-return-assign
    await page.$eval('input[id="location1"]', (el) => el.value = '');
    await page.click('button.job_search_hide + input');
    await page.waitForSelector('.modal-dialog');
    await page.mouse.click(1000, 800);
    await page.waitForTimeout(5000);
    // Filters based on jobs posted within last 10 days
    await page.click('button[class="select-menu-header"]');
    await page.click('.select-menu-item:nth-child(3)');
    await page.waitForSelector('.breadcrumb_list.breadcrumb li:nth-child(2)');
    await page.click('.breadcrumb_list.breadcrumb li:nth-child(2)');
    Logger.info('Setting filter by 10 days...');
    // Filters based on internship tag
    await page.waitForSelector('menu[id="select-menu-search_filters_tags"] .select-menu-item');
    try {
      await page.evaluate(() => {
        [...document.querySelectorAll('menu[id="select-menu-search_filters_tags"] .select-menu-item')]
            .find(element => element.textContent.includes('Software Engineering Intern')).click();
      });
      Logger.trace('Filtering based on internship tag...');
    } catch (err5) {
      Logger.info('No internship tags found');
    }
    // any distance
    await page.waitForSelector('ol[itemtype="http://schema.org/BreadcrumbList"] li:nth-child(2)');
    await page.click('ol[itemtype="http://schema.org/BreadcrumbList"] li:nth-child(2)');
    await page.waitForSelector('.job_content');
    try {
      // Click the "Load More" button
      await page.click('.load_more_jobs');
      await autoScroll(page);
    } catch (err) {
      Logger.warn('--- All jobs are Listed, no "Load More" button --- ');
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
        Logger.warn('Error fetching link, skipping');
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
    Logger.warn('Our Error:', e.message);
    await browser.close();
  }
}

if (process.argv.includes('main')) {
  const headless = checkHeadlessOrNot(process.argv);
  if (headless === -1) {
    Logger.error('Invalid argument supplied, please use "open", or "close"');
    process.exit(0);
  }
  main(headless);
}

export default main;
