import log from 'loglevel';
import { fetchInfo, startBrowser, writeToJSON } from './scraperFunctions.js';

async function main() {
  let browser;
  let page;
  const data = [];
  log.enableAll();
  try {
    [browser, page] = await startBrowser();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');
    await page.goto('https://www.nsf.gov/crssprgm/reu/list_result.jsp?unitid=5049');
    await page.waitForSelector('button[id="itemsperpage_top"]');
    await page.click('button[id="itemsperpage_top"]');
    await page.waitForSelector('a[onclick="showItemsPerPageForm(event, \'All\', \'?unitid=5049\')"]');
    await page.click('a[onclick="showItemsPerPageForm(event, \'All\', \'?unitid=5049\')"]');
    try {
      await page.waitForSelector('td[data-label="Site Information: "] > div > a');
      const position = await page.evaluate(() => {
        const positions = document.querySelectorAll('td[data-label="Site Information: "] > div > a');
        const posList = [...positions];
        return posList.map(pos => pos.innerText);
      });
      log.info(position);
      log.info(position.length);
      const urls = await page.evaluate(() => {
        const urlFromWeb = document.querySelectorAll('td[data-label="Site Information: "] > div > a');
        const urlList = [...urlFromWeb];
        return urlList.map(url => url.href);
      });
      log.info(urls);
      log.info(urls.length);
      const company = await page.evaluate(() => {
        const companies = document.querySelectorAll('td[data-label="Site Information: "] > div > strong');
        const compList = [...companies];
        return compList.map(com => com.innerText);
      });
      log.info(company);
      log.info(company.length);
      await page.waitForSelector('td[data-label="Site Location: "] > div');
      const location = await page.evaluate(() => {
        const locations = document.querySelectorAll('td[data-label="Site Location: "] > div');
        const locList = [...locations];
        return locList.map(loc => loc.innerText);
      });
      log.info(location);
      log.info(location.length);
      const city = [];
      const state = [];
      for (let i = 0; i < location.length; i++) {
        const loc = location[i].split(', ');
        city.push(loc[0]);
        state.push(loc[1]);
      }
      log.info(city);
      log.info(city.length);
      log.info(state);
      log.info(state.length);
      const description = await page.evaluate(() => {
        const skills = document.querySelectorAll('td[data-label="Additional Information: "] > div ');
        const skillList = [...skills];
        return skillList.map(list => list.innerText);
      });
      log.info(description);
      log.info(description.length);
      try {
        const lastScraped = new Date();
        for (let i = 0; i < urls.length; i++) {
          data.push({
            url: urls[i],
            position: position[i],
            company: company[i],
            location: { city: city[i], state: state[i] },
            lastScraped: lastScraped,
            description: description[i],
          });
        }
      } catch (err1) {
        log.error(err1.message);
      }
      console.log(data);
    } catch (err2) {
      log.error(err2.message);
    }
    await writeToJSON(data, 'nsf-reu');
    await browser.close();
  } catch (err3) {
    log.error(err3.message);
  }
}

main();
