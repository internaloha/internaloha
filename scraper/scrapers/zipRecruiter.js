/* eslint-disable max-len,no-console,no-await-in-loop */
import puppeteer from 'puppeteer';
import fs from 'fs';
import log from 'loglevel';
import { fetchInfo, autoScroll } from './scraperFunctions.js';

const myArgs = process.argv.slice(2);

async function main() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');
  log.enableAll();
  try {
    await page.goto('https://www.ziprecruiter.com/');
    await page.waitForSelector('input[id="search1"]');
    await page.waitForSelector('input[id="location1"]');
    const searchQuery = myArgs.join(' ');
    log.info('Inputting search query:', searchQuery);
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
    log.info('Setting filter by 10 days...');
    // Filters based on internship tag
    await page.waitForSelector('menu[id="select-menu-search_filters_tags"] .select-menu-item');
    try {
      await page.evaluate(() => {
        [...document.querySelectorAll('menu[id="select-menu-search_filters_tags"] .select-menu-item')]
            .find(element => element.textContent.includes('internship')).click();
      });
      log.trace('Filtering based on internship tag...');
    } catch (err5) {
      log.info('No internship tags found');
    }
    // any distance
    await page.waitForSelector('ol[itemtype="http://schema.org/BreadcrumbList"] li:nth-child(2)');
    await page.click('ol[itemtype="http://schema.org/BreadcrumbList"] li:nth-child(2)');
    await page.waitForSelector('.job_content');
    try {
      // Click the "Load More" button
      await page.click('.load_more_jobs');
      // Jobs listed using infinite scroll, scrolls until it reaches ending
      await autoScroll(page);
    } catch (err) {
      log.warn('--- All jobs are Listed, no "Load More" button --- ');
    }
    // grab all links
    const elements = await page.evaluate(
        () => Array.from(
            // eslint-disable-next-line no-undef
            document.querySelectorAll('.job_link.t_job_link'),
            a => a.getAttribute('href'),
        ),
    );
    const data = [];
    const skippedPages = [];
    let jobs = 0;
    log.info(elements.length);
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
          const position = await fetchInfo(page, '.job_title', 'innerText');
          const company = await fetchInfo(page, '.hiring_company_text.t_company_name', 'innerText');
          const location = await fetchInfo(page, 'span[data-name="address"]', 'innerText');
          const description = await fetchInfo(page, '.jobDescriptionSection', 'innerHTML');
          const posted = await fetchInfo(page, '.job_more span[class="data"]', 'innerText');
          const date = new Date();
          let daysBack = 0;
          const lastScraped = new Date();
          if (posted.includes('yesterday')) {
            daysBack = 1;
          } else {
            daysBack = posted.match(/\d+/g);
          }
          date.setDate(date.getDate() - daysBack);
          // console.log(location.match(/([^,]*)/g));
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
          log.trace('--- Went off of ZipRecruiter, skipping ---');
          skippedPages.push(currentPage);
        }
      } catch (err4) {
        log.warn('Error fetching link, skipping');
      }
    }
    // write results to JSON file
    await fs.writeFile('./data/canonical/ziprecruiter.canonical.data.json',
        JSON.stringify(data, null, 4), 'utf-8',
        err => (err ? log.warn('\nData not written!', err) :
            log.info('\nData successfully written!')));

    log.info('Total jobs scraped:', jobs);
    log.info('Total links skipped:', skippedPages.length);
    log.info('Links skipped:', skippedPages);
    log.info('Closing browser...');
    await browser.close();
  } catch (e) {
    log.warn('Our Error:', e.message);
    await browser.close();
  }
}
main().then();
