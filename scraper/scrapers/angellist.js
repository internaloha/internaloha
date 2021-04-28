import puppeteer from 'puppeteer';
import fs from 'fs';
import Logger from 'loglevel';
import moment from 'moment';
import { fetchInfo, autoScroll } from './scraper-functions.js';

const USERNAME_SELECTOR = '#user_email';
const PASSWORD_SELECTOR = '#user_password';
const CTA_SELECTOR = '#new_user > div:nth-child(6) > input';

const credentials = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

async function getData(page) {
  const results = [];
  for (let i = 0; i < 5; i++) {
    // description, location, title, company
    results.push(fetchInfo(page, '#main > div.component_70709 > div > div > div > div.profile_89ad5 > div > div > div.component_659a3 > div.body_31259 > div.content_6572f > div', 'innerHTML'));
    results.push(fetchInfo(page, '#main > div.component_70709 > div > div > div > div.profile_89ad5 > div > div > div.component_659a3 > div.body_31259 > div.sidebar_f82a8 > div > div.component_4105f > div:nth-child(1) > dd > div > span', 'innerText'));
    results.push(fetchInfo(page, '#main > div.component_70709 > div > div > div > div.profile_89ad5 > div > div > div.component_659a3 > div.title_927e9 > div > h2', 'innerText'));
    results.push(fetchInfo(page, '#main > div.component_70709 > div > div > div > section > div > div.name_af83c > div > div.styles_component__1WTsC.styles_flexRow__35QHu > h1 > a', 'innerText'));
  }
  return Promise.all(results);
}

async function startBrowser() {
  const browser = await puppeteer.launch({ headless: false, devtools: true, slowMo: 2000, // slow down by 250ms
  });
  const page = await browser.newPage();
  return { browser, page };
}

async function main(url) {
  const data = [];
  const scraperName = 'Angellist: ';
  const startTime = new Date();
  Logger.error('Starting scraper angellist at', moment().format('LT'));
  const { browser, page } = await startBrowser();
  await page.setViewport({ width: 1366, height: 768 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9');
  await page.goto(url);
  // await page.waitForTimeout(30000);
  await page.waitForSelector(USERNAME_SELECTOR, { timeout: 120000 });
  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(credentials.angellist.user);
  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(credentials.angellist.password);
  await page.click(CTA_SELECTOR);
  await page.waitForNavigation();
  // await page.waitForTimeout(5000);
  await page.waitForSelector('a.component_21e4d.defaultLink_7325e.information_7136e');
  await autoScroll(page);
  await autoScroll(page);
  await autoScroll(page);
  await page.waitForSelector('a.component_21e4d.defaultLink_7325e.information_7136e');
  const elements = await page.$x('a.component_21e4d.defaultLink_7325e.information_7136e');
  const src = await elements.getProperty('src');
  const srcTxt = await src.jsonValue();
  Logger.info({ srcTxt });
  // const elements = await page.JSON.parse(
  //     () => Array.from(
  //         document.querySelectorAll('a.component_21e4d.defaultLink_7325e.information_7136e'),
  //         a => a.getAttribute('href'),
  //     ),
  // );
  Logger.info(elements.length);
  elements.forEach(element => {
    Logger.info(element);
  });
  fs.writeFileSync('angellist-urls.json', JSON.stringify(elements, null, 4),
      (err1) => {
        if (err1) {
          Logger.warn(scraperName, err1);
        }
      });
  for (let i = 0; i < elements.length; i++) {
    // elements[i] = 'http://angel.co' + elements[i];
    const element = `http://angel.co${elements[i]}`;
    await page.goto(element, { waitUntil: 'domcontentloaded' });
    const currentURL = page.url();
    const skills = 'N/A';
    const lastScraped = new Date();
    const [description, location, title, company] = await getData(page);
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
      (err2) => {
        if (err2) {
          Logger.warn(scraperName, err2);
        }
      });
  Logger.error(`Elapsed time for angellist: ${moment(startTime).fromNow(true)} | ${data.length} listings scraped `);
  await browser.close();
}

async function goTo() {
  const scraperName = 'Angellist: ';
  try {
    await main('https://angel.co/login');
  } catch (err) {
    Logger.warn(scraperName, 'Our Error: ', err.message);
  }
  // process.exit(1);
}
export default goTo;
