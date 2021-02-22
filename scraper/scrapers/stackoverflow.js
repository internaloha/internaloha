import log from 'loglevel';
import { fetchInfo, startBrowser, writeToJSON, isRemote } from './scraper-functions.js';

async function getData(page) {
  const data = [];
  const text = await fetchInfo(page, 'span[class="description fc-light fs-body1"]', 'textContent');
  const number = text.match(/\d+/gm);
  log.enableAll();
  log.trace('Internships found:', number[0]);
  // goes to each page
  const elements = await page.evaluate(
      () => Array.from(
          // eslint-disable-next-line no-undef
          document.querySelectorAll('a[class="s-link stretched-link"]'),
          a => `https://stackoverflow.com${a.getAttribute('href')}`,
      ),
  );
  for (let i = 0; i < number[0]; i++) {
    await page.goto(elements[i]);
    try {
      const position = await fetchInfo(page, 'div[class="grid--cell fl1"] h1', 'innerText');
      let company = '';
      try {
        company = await fetchInfo(page, 'div[class="fc-black-700 mb4"] a', 'innerText');
      } catch (noCompany) {
        company = 'Unknown';
      }
      const posted = await fetchInfo(page, 'ul[class="horizontal-list horizontal-list__lg fs-body1 fc-black-500 ai-baseline mb24"]', 'innerText');
      const description = await fetchInfo(page, 'section[class="mb32 fs-body2 fc-medium"]', 'innerHTML');
      const skills = await page.evaluate(
          () => Array.from(
              // eslint-disable-next-line no-undef
              document.querySelectorAll('section[class="mb32"]:nth-child(3) a'),
              a => a.textContent,
          ),
      );
      const date = new Date();
      let daysBack = 0;
      const lastScraped = new Date();
      if (posted.includes('yesterday')) {
        daysBack = 1;
      } else {
        daysBack = posted.match(/\d+/g);
      }
      date.setDate(date.getDate() - daysBack);
      let location = '';
      let city = '';
      let state = '';
      try {
        location = await fetchInfo(page, 'div[class="fc-black-700 mb4"] span', 'innerText');
        city = location.match(/([^ –\n][^,]*)/g)[0].trim();
        state = location.match(/([^,]*)/g)[2].trim();
      } catch (noLocation) {
        location = '';
        city = 'Unknown';
        state = 'Unknown';
      }
      // eslint-disable-next-line no-unused-vars
      let remote = false;
      if (isRemote(position) || isRemote(city) || isRemote(description)
          || isRemote(city) || isRemote(state)) {
        remote = true;
      }
      data.push({
        position: position.trim(),
        company: company.trim(),
        location: { city: city, state: state },
        posted: date,
        url: elements[i],
        skills: skills,
        lastScraped: lastScraped,
        description: description.trim(),
      });
      log.info(position.trim());
    } catch (err) {
      log.warn('Our Error: ', err.message);
    }
  }
  return data;
}

async function main() {
  let browser;
  let page;
  log.enableAll();
  // eslint-disable-next-line max-len
  try {
    [browser, page] = await startBrowser();
    await page.goto('https://stackoverflow.com/jobs?q=internship');
    await page.waitForNavigation;
    // grab all links
    await getData(page).then((data => {
      log.info(data);
      writeToJSON(data, 'stackoverflow');
    }));
    await browser.close();
  } catch (err) {
    log.warn('Our Error:', err.message);
    await browser.close();
  }
}
main();
