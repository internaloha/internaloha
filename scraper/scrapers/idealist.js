import moment from 'moment';
import log from 'loglevel';
import { fetchInfo, startBrowser, writeToJSON } from './scraperFunctions.js';

const searchQuery = process.argv.slice(2).join(' ');

async function createDate(date, sub) {
  let newDate = date.substring(sub);
  log.info(`newDate 2 ${newDate}`);
  newDate = newDate.replace(/,/g, '');
  log.info(`newDate 3 ${newDate}`);
  log.info(moment(newDate, 'LL'));
  const momentDate = moment(newDate, 'LL');
  return momentDate.toDate();
}

async function getLinks(page) {
  return page.evaluate(
    () => Array.from(
      document.querySelectorAll('[data-qa-id=search-result-link]'),
      a => a.getAttribute('href'),
    ),
  );
}

async function getElements(page) {
  let hasNext = true;
  const elements = [];
  while (hasNext === true) {
    try {
      await page.waitForTimeout(1000);
      getLinks(page).then(links => {
        elements.push(links);
      });
      await page.waitForTimeout(1000);
      await page.click('button[class="Button__StyledButton-sc-1avp0bd-0 ggDAbQ Pagination__ArrowLink-nuwudv-2 eJsmUe"]:last-child');
    } catch (e) {
      log.warn(e.message);
      hasNext = false;
      log.trace('Reached the end of pages!');
    }
  }
  return elements;
}

// eslint-disable-next-line consistent-return
async function getData(page, elements) {
  try {
    const data = [];
    for (let i = 0; i < elements.length; i++) {
      for (let j = 0; j < elements[i].length; j++) {
        const element = `https://www.idealist.org${elements[i][j]}`;
        log.info(element);
        await page.goto(element, { waitUntil: 'domcontentloaded' });
        const position = await fetchInfo(page, '[data-qa-id=listing-name]', 'innerText');
        let company = '';
        try {
          company = await fetchInfo(page, '[data-qa-id=org-link]', 'innerText');
        } catch (e) {
          log.info('No company found. Setting to N/A');
          company = 'N/A';
        }
        let location = '';
        let locationArray = {};
        try {
          location = await fetchInfo(page, 'div[class="Text-sc-1wv914u-0 dSMMlM"]', 'innerText');
          location = location.match(/\|\D+[^Share]/gm);
          let loc = location[0].split('| ');
          loc = loc[1].split(', ');
          const city = loc[0].trim();
          const state = loc[1].trim();
          locationArray = { city: city, state: state };
        } catch (e) {
          log.warn(e.message);
          log.warn('No location found');
          location = 'N/A';
        }
        let time = '';
        try {
          time = await fetchInfo(page, 'div[class="Text-sc-1wv914u-0 cWSRKM"]', 'innerText');
          const date = new Date();
          let daysBack = 0;
          // time = scraped posting- "30 days.. 2 hours ago.. etc"
          if (time.includes('hours') || (time.includes('hour')) || (time.includes('minute')) || (time.includes('minutes'))) {
            // set to 0 because it was posted today
            daysBack = 0;
          } else if ((time.includes('week')) || (time.includes('weeks'))) {
            // regex just takes the date number (eg. '2' from 2 weeks ago). Multiply by 7 because 7 days in a week
            daysBack = time.match(/\d+/g) * 7;
          } else {
            // month tag (varies but i just used 30)
            daysBack = time.match(/\d+/g) * 30;
          }
// sets the date back how many days back (eg. 30 days back
          date.setDate(date.getDate() - daysBack);
          time = date;
        } catch (e) {
          log.warn('No startDate found. Setting to N/A');
          time = 'N/A';
        }
        let start = '';
        try {
          // try to click the element. If it doesn't exist, we know there's no start date
          await page.click('div[class="Text-sc-1wv914u-0 TPzlz"]');
          start = await fetchInfo(page, 'div[class="Text-sc-1wv914u-0 TPzlz"]', 'innerText');
          const newDate = start.match(/\b(\w*Start Date\w*)\b ([0-9]){1,2}, ([0-9]){4}/g);
          if (newDate != null) {
            start = await createDate(newDate.toString(), 13);
          } else {
            start = '';
          }
        } catch (e) {
          log.info('No startDate found. Setting to N/A');
          start = '';
        }
        let due = '';
        try {
          // try to click the element. If it doesn't exist, we know there's no due date
          await page.click('div[class="Text-sc-1wv914u-0 TPzlz"]');
          due = await fetchInfo(page, 'div[class="Text-sc-1wv914u-0 TPzlz"]', 'innerText');
          const newDate = due.match(/\b(\w*Deadline\w*)\b ([0-9]){1,2}, ([0-9]){4}/g);
          log.info(newDate);
          if (newDate != null) {
            due = await createDate(newDate.toString(), 8);
          } else {
            due = '';
          }
        } catch (e) {
          log.info('No dueDate found. Setting to N/A');
          due = '';
        }
        const lastScraped = new Date();
        // clicking read more description
        await page.click('div[class=" Box__BaseBox-sc-1wooqli-0 gHIryv"]');
        const description = await fetchInfo(page, 'div[class="Text-sc-1wv914u-0 kXDBTb idlst-rchtxt Text__StyledRichText-sc-1wv914u-1 ctyuXi"]', 'innerHTML');
        if (due !== '') {
          data.push({
            position: position,
            company: company,
            location: locationArray,
            posted: time,
            due: due,
            url: element,
            lastScraped: lastScraped,
            description: description,
          });
        } else if (start !== '') {
          data.push({
            position: position,
            company: company,
            location: locationArray,
            posted: time,
            due: due,
            start: start,
            url: element,
            lastScraped: lastScraped,
            description: description,
          });
        } else {
          data.push({
            position: position,
            company: company,
            location: locationArray,
            posted: time,
            url: element,
            lastScraped: lastScraped,
            description: description,
          });
        }
      }
    }
    return data;
  } catch (e) {
    log.warn(e.message);
  }
}

async function main() {
  let browser;
  let page;
  log.enableAll(); // this enables console logging
  try {
    [browser, page] = await startBrowser();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');
    await page.goto('https://www.idealist.org/en/');
    await page.waitForSelector('#layout-root > div.idlst-flx.Box__BaseBox-sc-1wooqli-0.lnKqQM > div.idlst-flx.Box__BaseBox-sc-1wooqli-0.dCQmbn.BaseLayout__PageContent-sc-10xtgtb-2.heQjSt > div.Box__BaseBox-sc-1wooqli-0.bsSECh > div > div.Box__BaseBox-sc-1wooqli-0.hpEILX > div.Box__BaseBox-sc-1wooqli-0.datyjK > div > div > div.idlst-flx.idlst-lgncntr.Box__BaseBox-sc-1wooqli-0.cDmdoN > div > form > div.Box__BaseBox-sc-1wooqli-0.ejycyy > div > input');
    // Selecting internships
    await page.click('div[class="css-bg1rzq-control react-select__control"]');
    await page.click('div[id="react-select-2-option-2"]');
    // inputting search query
    await page.type('input[data-qa-id="search-input"]', searchQuery);
    await page.waitForSelector('button[data-qa-id="search-button"]');
    await page.click('button[data-qa-id="search-button"]');
    await page.waitForSelector('#results > div > div > div.Box__BaseBox-sc-1wooqli-0.iuHlOF > div:nth-child(2) > div > a');
    await getElements(page).then((elements) => {
      getData(page, elements).then((data => {
        log.info(data);
        writeToJSON(data, 'idealist');
      }));
    });
    await browser.close();
  } catch (e) {
    log.warn(e);
  }
}

main();
