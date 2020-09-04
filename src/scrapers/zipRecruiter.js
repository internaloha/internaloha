/* eslint-disable max-len,no-console,no-await-in-loop */
const puppeteer = require('puppeteer');
const fs = require('fs');

const myArgs = process.argv.slice(2);

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

async function fetchInfo(page, selector) {
  let result = '';
  try {

    await page.waitForSelector(selector);
    result = await page.evaluate((select) => document.querySelector(select).innerText, selector);
  } catch (error) {
    console.log('Our Error: fetchInfo() failed.\n', error.message);
    result = 'Error';
  }
  return result;
}

(async () => {

  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1100, height: 900,
  });

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');

  try {

    await page.goto('https://www.ziprecruiter.com/');
    await page.waitForSelector('input[id="search1"]');
    await page.waitForSelector('input[id="location1"]');

    const searchQuery = myArgs.join(' ');

    console.log('Inputting search query:', searchQuery);
    await page.type('input[id="search1"', searchQuery);
    await page.$eval('input[id="location1"]', (el) => el.value = '');
    await page.click('button.job_search_hide + input');

    await page.waitForSelector('.modal-dialog');

    await page.mouse.click(1000, 800);

    // Filters based on jobs posted within last 10 days
    await page.click('button[class="select-menu-header"]');
    await page.click('.select-menu-item:nth-child(3)');

    await page.waitForSelector('.breadcrumb_list.breadcrumb li:nth-child(2)');
    await page.click('.breadcrumb_list.breadcrumb li:nth-child(2)');
    console.log('Setting filter by 10 days...');

    // Filters based on internship tag
    await page.waitForSelector('menu[id="select-menu-search_filters_tags"] .select-menu-item');
    try {
      await page.evaluate(() => {
        [...document.querySelectorAll('menu[id="select-menu-search_filters_tags"] .select-menu-item')]
            .find(element => element.textContent.includes('internship')).click();
      });
      console.log('Filtering based on internship tag...');

    } catch (err5) {
      console.log('No internship tags found');
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
      console.log('--- All jobs are Listed, no "Load More" button --- ');
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

    console.log(elements.length);

    for (let i = 0; i < elements.length; i++) {
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

        const position = await fetchInfo(page, '.job_title');
        const company = await fetchInfo(page, '.hiring_company_text.t_company_name');
        const location = await fetchInfo(page, 'span[data-name="address"]');
        const description = await fetchInfo(page, '.jobDescriptionSection');
        const posted = await fetchInfo(page, '.job_more span[class="data"]');

        const date = new Date();
        let daysBack = 0;
        const lastScraped = new Date();

        if (posted.includes('day') || posted.includes('days')) {
          daysBack = 0;
        } else if (posted.includes('yesterday')) {
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
        console.log('--- Went off of ZipRecruiter, skipping ---');
        skippedPages.push(currentPage);
      }
    }

    // write results to JSON file
    await fs.writeFile('scrapers/data/canonical/ziprecruiter.canonical.data.json',
        JSON.stringify(data, null, 4), 'utf-8',
        err => (err ? console.log('\nData not written!', err) :
            console.log('\nData successfully written!')));

    console.log('Total jobs scraped:', jobs);
    console.log('Total links skipped:', skippedPages.length);
    console.log('Links skipped:', skippedPages);
    console.log('Closing browser...');
    await browser.close();

  } catch (e) {
    console.log('Our Error:', e.message);
    await browser.close();
  }

})();
