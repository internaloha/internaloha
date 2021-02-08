import log from 'loglevel';
import { fetchInfo, startBrowser, writeToJSON } from './scraper-functions.js';

async function getLinks(page) {
  return page.evaluate(
    () => Array.from(
      // eslint-disable-next-line no-undef
      document.querySelectorAll('p.title a'),
      a => `https://www.ihiretechnology.com${a.getAttribute('href')}`,
    ),
  );
}

async function main() {
  let browser;
  let page;
  const data = [];
  log.enableAll(); // this enables console logging
  try {
    [browser, page] = await startBrowser();
    // sign in process
    await page.goto('https://www.ihiretechnology.com/jobseeker/account/password');
    await page.type('input[id=EmailAddress]', 'ausui@hawaii.edu');
    await page.click('button.btn.btn-link');
    await page.waitForSelector('input[id=Password]');
    await page.type('input[id=Password]', 'Bball2424~');
    await page.click('button.btn.btn-success.btn-lg');
    // click search page
    await page.waitForSelector('li.text-center.nav-list-item-1 a');
    await page.click('ul.nav.navbar-nav li:nth-child(4)');
    await page.waitForTimeout(2000);
    await page.waitForTimeout(5000);
    // type technology
    await page.waitForSelector('input[class=form-control]');
    await page.type('input[class=form-control]', 'technology');
    await page.waitForTimeout(3000);
    // focus on location field- type nothing
    await page.focus('#location');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type('#location', ' ');
    // click find jobs button
    await page.click('button.btn.btn-primary.loading-indicator.radius-fix');
    await page.waitForTimeout(3000);
    // click checkboxes filters
    // past 30 days
    await page.waitForSelector('ul#AddedDate-aggregation-group.nav.nav-list > li:nth-child(5) > div.checkbox > label > input');
    await page.click('ul#AddedDate-aggregation-group.nav.nav-list > li:nth-child(5) > div.checkbox > label > input');
    await page.waitForTimeout(2000);
    log.trace('Set for last 30 days...');
    // entry level
    await page.click('div#search-aggregation-filter-section.well.well-sm.aggregation-container > div:nth-child(5) > label.aggregation-group > i');
    await page.waitForTimeout(2000);
    await page.click('ul#ExperienceLevel-aggregation-group.nav.nav-list > li:nth-child(5) > div.checkbox > label > input');
    await page.waitForTimeout(2000);
    log.trace('Setting entry level filter..');
    // internship
    await page.click('div#search-aggregation-filter-section.well.well-sm.aggregation-container > div:nth-child(8) > label.aggregation-group > i');
    await page.waitForTimeout(2000);
    await page.click('ul#EmploymentType-aggregation-group.nav.nav-list > li:nth-child(6) > div.checkbox > label > input');
    log.trace('Setting as internship tag...');
    // variables
    const links = [];
    let jobNumber = 0;
    try {
      // pagination, gathering links from each page
      const lastPageNum = 10;
      for (let index = 0; index < lastPageNum; index++) {
        await page.waitForTimeout(1000);
        getLinks(page).then((pageLinks => {
          log.info(pageLinks);
          links.push(pageLinks);
        }));
        await page.waitForTimeout(3000);
        if (index !== lastPageNum - 1) {
          await page.click('ul.list-inline.horizontal > li:nth-child(3) > a:nth-child(1)');
        } else {
          log.trace('end of pages');
          index = lastPageNum;
        }
      }
    } catch (e) {
      log.warn('Error with getting links: ', e.message);
    }
    try {
      // go through each link and fetch info
      for (let i = 0; i < links.length; i++) {
        for (let j = 0; j < links[i].length; j++) {
          try {
            await page.goto(links[i][j]);
            jobNumber++;
            await page.waitForSelector('div.jobdescription');
            // scrape info off each website
            // use natural parser to scrape qualifications and other info
            const position = await fetchInfo(page, 'h3[class=text-blue]', 'innerText');
            const location = await fetchInfo(page, 'div[class=col-xs-8] li:nth-child(2)', 'innerText');
            let state = '';
            if (!location.match(/([^,]*)/g)[2]) {
              state = 'United States';
            } else {
              state = location.match(/([^,]*)/g)[2].trim();
            }
            const description = await fetchInfo(page, 'div.jobdescription', 'innerHTML');
            const company = await fetchInfo(page, 'div[class=col-xs-8] li:nth-child(1)', 'innerText');
            const lastScraped = new Date();

            const posted = await fetchInfo(page, 'div[class=col-xs-8] li:nth-child(3)', 'innerText');
            const date = new Date();
            let daysBack = 0;
            if (posted.includes('day') || posted.includes('days')) {
              const matched = posted.match(/(\d+)/);
              if (matched) {
                daysBack = matched[0];
              }
            }
            date.setDate(date.getDate() - daysBack);
            data.push({
              position: position.trim(),
              location: {
                city: location.match(/([^,]*)/g)[0],
                state: state,
              },
              company: company.trim(),
              posted: date,
              url: links[i][j],
              lastScraped: lastScraped,
              description: description.trim(),
            });
            log.info(position);
          } catch (skip) {
            log.trace(skip.message);
          }
        }
      }
    } catch (er2) {
      log.warn('Error scraping links:', er2.message);
    }
    log.info(data);
    log.info(jobNumber);
    try {
      await writeToJSON(data, 'iHireTech');
    } catch (err) {
      log.warn('Something went wrong', err.message);
    }
    await browser.close();
    log.trace('Process Completed');
  } catch (err) {
    log.warn('Something went wrong', err.message);
    await browser.close();
  }
}

main();
