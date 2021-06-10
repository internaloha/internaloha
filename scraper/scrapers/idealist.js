import Logger from 'loglevel';
import moment from 'moment';
import { startBrowser, fetchInfo, writeToJSON } from './scraper-functions.js';

async function getLinks(page) {
  return page.evaluate(
    () => Array.from(
      document.querySelectorAll('[data-qa-id="search-result-link"]'),
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
      hasNext = false;
      Logger.trace('Reached the end of pages!');
    }
  }
  return elements;
}

async function getData(page, elements) {
  const data = [];
  try {
    for (let i = 0; i < elements.length; i++) {
      for (let j = 0; j < elements[i].length; j++) {
        const element = `https://www.idealist.org${elements[i][j]}`;
        await page.goto(element);
        const position = await fetchInfo(page, '[data-qa-id=listing-name]', 'innerText');
        let company = '';
        try {
          company = await fetchInfo(page, '[data-qa-id=org-link]', 'innerText');
        } catch (e) {
          Logger.info('No company found. Setting to N/A');
          company = 'N/A';
        }
        let location = '';
        let locationArray = {};
        try {
          location = await fetchInfo(page, 'div[class="Text-sc-1wv914u-0 dSMMlM"] > div[class=" Box__BaseBox-sc-1wooqli-0 kMROVK"]', 'outerText');
          const loc = location.split(/\n/);
          const where = loc[2].split(', ');
          const city = where[0].trim();
          const state = where[1].trim();
          locationArray = { city: city, state: state };
        } catch (e) {
          Logger.debug(e.message);
          Logger.debug('No location found');
          location = 'N/A';
        }
        let time = '';
        try {
          time = await fetchInfo(page, 'div[class="Text-sc-1wv914u-0 gzGAku"]', 'innerText');
          const date = new Date();
          let daysBack = 0;
          // time = scraped posting- "30 days.. 2 hours ago.. etc"
          if (time.includes('hours') || (time.includes('hour')) || (time.includes('minute')) || (time.includes('minutes'))) {
            // set to 0 because it was posted today
            daysBack = 0;
          } else if ((time.includes('day')) || (time.includes('days'))) {
            daysBack = time.match(/\d+/g);
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
          Logger.warn('No startDate found. Setting to N/A');
          time = 'N/A';
        }
        const lastScraped = new Date();
        // clicking read more description
        await page.click('div[class=" Box__BaseBox-sc-1wooqli-0 gHIryv"]');
        const description = await fetchInfo(page, 'div[class="Text-sc-1wv914u-0 kXDBTb idlst-rchtxt Text__StyledRichText-sc-1wv914u-1 bDfKdG"]', 'innerHTML');
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
  } catch (e) {
    Logger.warn('Idealist Error:', e.message);
  }
  return data;
}

async function main(headless) {
  // eslint-disable-next-line no-unused-vars
  let browser;
  let page;
  let data = [];
  const startTime = new Date();
  const scraperName = 'Idealist: ';
  try {
    Logger.error('Starting scraper idealist at', moment().format('LT'));
    [browser, page] = await startBrowser(headless);
    // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');
    await page.goto('https://www.idealist.org/en/');
    await page.waitForSelector('#layout-root > div.idlst-flx.Box__BaseBox-sc-1wooqli-0.lnKqQM > div.idlst-flx.Box__BaseBox-sc-1wooqli-0.dCQmbn.BaseLayout__PageContent-sc-10xtgtb-2.heQjSt > div.Box__BaseBox-sc-1wooqli-0.bsSECh > div > div.Box__BaseBox-sc-1wooqli-0.hpEILX > div.Box__BaseBox-sc-1wooqli-0.datyjK > div > div > div.idlst-flx.idlst-lgncntr.Box__BaseBox-sc-1wooqli-0.cDmdoN > div > form > div.Box__BaseBox-sc-1wooqli-0.ejycyy > div > input');
    // Selecting internships
    await page.click('div[class="react-select__control css-yk16xz-control"]');
    await page.click('div[id="react-select-2-option-2"]');
    // inputting search query
    await page.type('input[data-qa-id="search-input"]', 'computer science intern');
    await page.waitForSelector('button[data-qa-id="search-button"]');
    await page.click('button[data-qa-id="search-button"]');
    await page.waitForSelector('#results > div > div > div.Box__BaseBox-sc-1wooqli-0.iuHlOF > div:nth-child(2) > div > a');
    const elements = await getElements(page);
    data = await getData(page, elements);
    await writeToJSON(data, 'idealist');
    await browser.close();
  } catch (e) {
    await browser.close();
    Logger.warn(scraperName, 'Error: ', e);
  }
  Logger.error(`Elapsed time for idealist: ${moment(startTime).fromNow(true)} | ${data.length} listings scraped `);
}

export default main;
