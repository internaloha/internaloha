import log from 'loglevel';
import puppeteer from 'puppeteer';
import { fetchInfo, startBrowser, writeToJSON } from './scraperFunctions.js';

async function main() {
  const data = [];
  const browser = await puppeteer.launch({
    headless: false,
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36');
    await page.goto('https://www.nsf.gov/crssprgm/reu/list_result.jsp?unitid=5049');
    await page.waitForSelector('button[id="itemsperpage_top"]');
    await page.click('button[id="itemsperpage_top"]');
    await page.waitForSelector('a[onclick="showItemsPerPageForm(event, \'All\', \'?unitid=5049\')"]');
    await page.click('a[onclick="showItemsPerPageForm(event, \'All\', \'?unitid=5049\')"]');
    try {
      await page.waitForSelector('td[data-label="Site Information: "] > div > a');
      const position = [];
      const urls = await page.evaluate(() => {
        const urlFromWeb = document.querySelectorAll('td[data-label="Site Information: "] > div > a');
        const urlList = [...urlFromWeb];
        position.push(urlList);
        return urlList.map(url => url.href);
      });
      console.log(position);
      //console.log(urls);
      await page.waitForSelector('td[data-label="Site Location: "] > div');
      const location = await page.evaluate(() => {
        const locations = document.querySelectorAll('td[data-label="Site Location: "] > div');
        const locList = [...locations];
        return locList.map(loc => loc.innerText);
      });
      //console.log(location);
      const city = [];
      const state = [];
      for (let i = 0; i < location.length; i++) {
        const loc = location[i].split(', ');
        city.push(loc[0]);
        state.push(loc[1]);
      }

    } catch (err1) {
      log.error(err1.message);
    }
  } catch (err2) {
    log.error(err2.message);
  }
}

main();
