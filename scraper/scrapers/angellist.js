import puppeteer from 'puppeteer';
import fs from 'fs';
import log from 'loglevel';
import { fetchInfo, autoScroll } from './scraperFunctions.js';

const USERNAME_SELECTOR = '#user_email';
const PASSWORD_SELECTOR = '#user_password';
const CTA_SELECTOR = '#new_user > div:nth-child(6) > input';
// angellist2
const commandLine = process.argv.slice(2);
const credentials = commandLine.slice(0, 2);
log.info(credentials);

async function startBrowser() {
  const browser = await puppeteer.launch({ headless: false, devtools: true, slowMo: 2000, // slow down by 250ms
  });
  const page = await browser.newPage();
  return { browser, page };
}

async function main(url) {
  log.enableAll();
  const { browser, page } = await startBrowser();
  await page.setViewport({ width: 1366, height: 768 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9');
  await page.goto(url);
  await page.waitForTimeout(30000);
  await page.waitForSelector(USERNAME_SELECTOR);
  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(credentials[0]);
  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(credentials[1]);
  await page.click(CTA_SELECTOR);
  await page.waitForNavigation();
  await page.waitForTimeout(5000);
  await page.waitForSelector('a.component_21e4d.defaultLink_7325e.information_7136e');
  await autoScroll(page);
  await autoScroll(page);
  await autoScroll(page);
  await page.waitForSelector('a.component_21e4d.defaultLink_7325e.information_7136e');
  const elements = await page.evaluate(
      () => Array.from(
          document.querySelectorAll('a.component_21e4d.defaultLink_7325e.information_7136e'),
          a => a.getAttribute('href'),
      ),
  );
  log.info(elements.length);
  elements.forEach(element => {
    log.info(element);
  });
  // fs.writeFileSync('angellist-urls.json', JSON.stringify(elements, null, 4),
  //     (err) => {
  //       if (err) {
  //         console.log(err);
  //       }
  //     });
  const data = [];
  for (let i = 0; i < elements.length; i++) {
    // elements[i] = 'http://angel.co' + elements[i];
    const element = `http://angel.co${elements[i]}`;
    await page.goto(element, { waitUntil: 'domcontentloaded' });
    const currentURL = page.url();
    const description = await fetchInfo(page, '#main > div.component_70709 > div > div > div > div.profile_89ad5 > div > div > div.component_659a3 > div.body_31259 > div.content_6572f > div', 'innerHTML');
    const location = await fetchInfo(page, '#main > div.component_70709 > div > div > div > div.profile_89ad5 > div > div > div.component_659a3 > div.body_31259 > div.sidebar_f82a8 > div > div.component_4105f > div:nth-child(1) > dd > div > span', 'innerText');
    const title = await fetchInfo(page, '#main > div.component_70709 > div > div > div > div.profile_89ad5 > div > div > div.component_659a3 > div.title_927e9 > div > h2', 'innerText');
    const company = await fetchInfo(page, '#main > div.component_70709 > div > div > div > section > div > div.name_af83c > div > div.styles_component__1WTsC.styles_flexRow__35QHu > h1 > a', 'innerText');
    const skills = 'N/A';
    const lastScraped = new Date();
    data.push(
        {
          position: title.trim(),
          company: company.trim(),
          location: {
            city: location.trim(),
            state: '',
          },
          url: currentURL,
          skills: skills,
          lastScraped: lastScraped,
          description: description.trim(),
        },
    );
  }
  await fs.writeFileSync('./data/canonical/angellist.canonical.data.json', JSON.stringify(data, null, 4),
      (err) => {
        if (err) {
          log.warn(err);
        }
      });
  await browser.close();
}

async function playTest() {
  log.enableAll();
  try {
    await main('https://angel.co/login');
  } catch (err) {
    log.warn('Our Error: ', err.message);
  }
  // process.exit(1);
}
playTest().then();
