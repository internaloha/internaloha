const puppeteer = require('puppeteer');
const fs = require('fs');
const moment = require('moment');

const searchQuery = process.argv.slice(2).join(' ');

async function createDate(date, sub) {
  let newestDate = new Date();
  let newDate = date.substring(sub);
  console.log(`newDate 2 ${newDate}`);
  newDate = newDate.replace(/,/g, '');
  console.log(`newDate 3 ${newDate}`);
  console.log(moment(newDate, 'LL'));
  const momentDate = moment(newDate, 'LL');
  newestDate = momentDate.toDate();
  return newestDate;
}

async function fetchInfo(page, selector) {
  let result = '';
  try {

    await page.waitForSelector(selector);
    // eslint-disable-next-line no-undef
    result = await page.evaluate((select) => document.querySelector(select).textContent, selector);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Our Error: fetchInfo() failed.\n', error.message);
    result = 'Error';
  }
  return result;
}

async function writeData(data) {
  await fs.writeFile('scrapers/data/canonical/idealist.canonical.data.json',
      JSON.stringify(data, null, 4), 'utf-8',
      // eslint-disable-next-line no-console
      err => (err ? console.log('\nData not written!', err) :
          // eslint-disable-next-line no-console
          console.log('\nData successfully written!')));
}

async function getLinks(page) {
  const links = await page.evaluate(
      () => Array.from(
          // eslint-disable-next-line no-undef
          document.querySelectorAll('[data-qa-id=search-result-link]'),
          a => a.getAttribute('href'),
      ),
  );
  return links;
}

async function getElements(page) {
  let hasNext = true;
  const elements = [];
  // eslint-disable-next-line eqeqeq
  while (hasNext == true) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await page.waitFor(1000);
      getLinks(page).then(links => {
        elements.push(links);
      });
      // eslint-disable-next-line no-await-in-loop,max-len
      await page.waitForSelector('button[class="Button__StyledButton-sc-1avp0bd-0 ggDAbQ Pagination__ArrowLink-nuwudv-2 eJsmUe"]:last-child');
      // eslint-disable-next-line max-len,no-await-in-loop
      const nextPage = await page.$('button[class="Button__StyledButton-sc-1avp0bd-0 ggDAbQ Pagination__ArrowLink-nuwudv-2 eJsmUe"]:last-child');
      // eslint-disable-next-line no-await-in-loop
      await nextPage.click();
      // console.log(elements);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e.message);
      // eslint-disable-next-line no-console
      console.log(elements);
      hasNext = false;
      // eslint-disable-next-line no-console
      console.log('\nReached the end of pages!');
    }
  }
  // eslint-disable-next-line no-console
  console.log(elements);
  return elements;
}

// eslint-disable-next-line consistent-return
async function getData(page, elements) {
  try {
    const data = [];
    for (let i = 0; i < elements.length; i++) {
      for (let j = 0; j < elements[i].length; j++) {
        const element = `https://www.idealist.org${elements[i][j]}`;
        // eslint-disable-next-line no-console
        console.log(element);
        // eslint-disable-next-line no-await-in-loop
        await page.goto(element, { waitUntil: 'domcontentloaded' });
        // eslint-disable-next-line no-await-in-loop
        const position = await fetchInfo(page, '[data-qa-id=listing-name]');
        let company = '';
        try {
          // eslint-disable-next-line no-await-in-loop
          company = await fetchInfo(page, '[data-qa-id=org-link]');
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log('No company found. Setting to N/A');
          company = 'N/A';
        }
        let location = '';
        let locationArray = {};
        try {
          // eslint-disable-next-line no-await-in-loop
          location = await fetchInfo(page, 'div[class="Text-sc-1wv914u-0 dDSGrp"]');
          const loc = location.match(/\| [^,]*, \w{2}/g);
          console.log(`loc: ${loc}`);
          const loc2 = loc.toString().substring(2);
          console.log(`loc2: ${loc2}`);
          const city = loc2.split(',')[0];
          const state = loc2.split(',')[1].substring(1);
          console.log(`city, state: ${city}, ${state}`);
          locationArray = { city: city, state: state };
          // console.log(city);
        } catch (e) {
          console.log('No location found');
          location = 'N/A';
        }
        let time = '';
        try {
          // eslint-disable-next-line max-len,no-await-in-loop
          time = await fetchInfo(page, 'div[class="Text-sc-1wv914u-0 jmLLTt"]');
          // create a new Date (shows current time)
          const date = new Date();
          let daysBack = 0;
          // ty Jenny for the conversion code
          // time = scraped posting- "30 days.. 2 hours ago.. etc"
          // eslint-disable-next-line max-len
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
          // eslint-disable-next-line no-console
          console.log('No startDate found. Setting to N/A');
          time = 'N/A';
        }
        let start = '';
        try {
          // eslint-disable-next-line no-await-in-loop
          start = await fetchInfo(page, 'div[class="Text-sc-1wv914u-0 TPzlz"]');
          // eslint-disable-next-line no-useless-escape
          const newDate = start.match(/\b(\w*Start Date\w*)\b ([0-9]){1,2}\, ([0-9]){4}/g);
          if (newDate != null) {
            // eslint-disable-next-line no-await-in-loop
            const newStart = await createDate(newDate.toString(), 13);
            start = newStart;
          } else {
            start = '';
          }
        } catch (e) {
          console.log('No startDate found. Setting to N/A');
          start = '';
        }
        let due = '';
        try {
          // eslint-disable-next-line no-await-in-loop
          due = await fetchInfo(page, 'div[class="Text-sc-1wv914u-0 TPzlz"]');
          // eslint-disable-next-line no-useless-escape
          const newDate = due.match(/\b(\w*Deadline\w*)\b ([0-9]){1,2}\, ([0-9]){4}/g);
          console.log(newDate);
          if (newDate != null) {
            // eslint-disable-next-line no-await-in-loop
            const newDue = await createDate(newDate.toString(), 8);
            due = newDue;
          } else {
            due = '';
          }
        } catch (e) {
          console.log('No dueDate found. Setting to N/A');
          due = '';
        }
        // eslint-disable-next-line no-await-in-loop,max-len
        const lastScraped = new Date();
        // eslint-disable-next-line no-await-in-loop,max-len
        const description = await fetchInfo(page, '.Text-sc-1wv914u-0.dlxdi.idlst-rchtxt.Text__StyledRichText-sc-1wv914u-1.ctyuXi');
        // eslint-disable-next-line no-console
        console.log(position);
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
    // eslint-disable-next-line no-console
    console.log(e.message);
  }
}

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    // eslint-disable-next-line max-len
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');

    await page.goto('https://www.idealist.org/en/');
    // eslint-disable-next-line max-len
    await page.waitForSelector('#layout-root > div.idlst-flx.Box__BaseBox-sc-1wooqli-0.lnKqQM > div.idlst-flx.Box__BaseBox-sc-1wooqli-0.dCQmbn.BaseLayout__PageContent-sc-10xtgtb-2.heQjSt > div.Box__BaseBox-sc-1wooqli-0.bsSECh > div > div.Box__BaseBox-sc-1wooqli-0.hpEILX > div.Box__BaseBox-sc-1wooqli-0.datyjK > div > div > div.idlst-flx.idlst-lgncntr.Box__BaseBox-sc-1wooqli-0.cDmdoN > div > form > div.Box__BaseBox-sc-1wooqli-0.ejycyy > div > input');
    await page.type('input[data-qa-id="search-input"]', searchQuery);
    await page.waitForSelector('button[data-qa-id="search-button"]');
    await page.click('button[data-qa-id="search-button"]');
    // eslint-disable-next-line max-len
    await page.waitForSelector('#results > div > div > div.Box__BaseBox-sc-1wooqli-0.iuHlOF > div:nth-child(2) > div > a');

    await getElements(page).then((elements) => {
      getData(page, elements).then((data => {
        // eslint-disable-next-line no-console
        console.log(data);
        writeData(data);
      }));
    });

  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
})();