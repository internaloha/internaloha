import puppeteer from 'puppeteer-extra';
import fs from 'fs';
import Logger from 'loglevel';
import moment from 'moment';
import _ from 'lodash';
import pluginStealth from 'puppeteer-extra-plugin-stealth';
import randomUserAgent from 'random-useragent';
import { fetchInfo, autoScroll } from './scraper-functions.js';
import Scraper from '../components/Scraper';

async function getData(page) {
  const results = [];
  for (let i = 0; i < 6; i++) {
    // description, location, title, company
    results.push(fetchInfo(page, 'div[class="styles_description__4fnTp"]', 'innerHTML'));
    results.push(fetchInfo(page, 'div[class="styles_component__1iUh1"] > div:nth-child(1) > dd > div > span', 'innerText'));
    results.push(fetchInfo(page, 'h2[class="styles_component__1kg4S styles_header__3m1pY __halo_fontSizeMap_size--2xl __halo_fontWeight_medium"]', 'innerText'));
    results.push(fetchInfo(page, 'a[class="styles_component__1c6JC styles_defaultLink__1mFc1 styles_anchor__2aXMZ"]', 'innerText'));

  }
  return Promise.all(results);
}

async function startBrowser() {
  // Slowmo changes speed of typing as well
  const browser = await puppeteer.launch({ headless: false, devtools: true, slowMo: 100, // slow down by 250ms
  });
  const page = await browser.newPage();
  return { browser, page };
}

class angellistTest extends Scraper {
  constructor(name, url, credentials, minimumListings, listingFilePath, statisticsFilePath) {
    super(name, url, credentials, minimumListings, listingFilePath, statisticsFilePath);
    this.credentials = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
    this.name = 'Angellist: ';
  }

  async mainScraper() {
    const startTime = new Date();
    Logger.error('Starting scraper angellist at', moment().format('LT'));
    puppeteer.use(pluginStealth());
    const { browser, page } = await startBrowser();
    await page.setViewport({ width: 1366, height: 768 });
    const userAgent = randomUserAgent.getRandom();
    await page.setUserAgent(userAgent);
    await page.setDefaultNavigationTimeout(0);
    await page.goto(url, { waitUntil: 'load', timeout: 0 });
    await page.waitForSelector('input[id="user_email"]');
    await this.login(page);
    await page.waitForNavigation();
    await page.waitForSelector('a[class="styles_component__1c6JC styles_defaultLink__1mFc1 styles_information__1TxGq"]');
    await page.click('div[class="styles_roleWrapper__2xVmi"] > button');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('Engineering');
    await page.keyboard.press('Enter');
    await page.click('div[class="styles_locationWrapper__ScGs8"] > button');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('United States');
    await page.keyboard.press('Enter');
    await page.click('button[class="styles_component__3A0_k styles_secondary__2g46E styles_small__6SIIc styles_toggle__3_6jN"]');
    await page.waitForSelector('button[class="styles_component__3A0_k styles_primary__3xZwV styles_small__6SIIc styles_emphasis__KRjK8"]');
    if (await page.$('div[class="styles_component__3ztKJ styles_active__3CAxI"] > div[class="styles_header__PMZlN"] > button') !== null) {
      // click clear
      await page.click('div[class="styles_component__3ztKJ styles_active__3CAxI"] > div[class="styles_header__PMZlN"] > button');
      await page.click('label[for="form-input--jobTypes--internship"]');
    } else {
      await page.click('label[for="form-input--jobTypes--internship"]');
    }
    await page.click('div[class="styles_footer__3DmVI"] > button[class="styles_component__3A0_k styles_primary__3xZwV styles_small__6SIIc styles_emphasis__KRjK8"]');
    for (let i = 0; i < 3; i++) {
      await autoScroll(page);
    }
// gets elements for length for loop
    let elements = await page.evaluate(
        () => Array.from(
            document.querySelectorAll('a[class="styles_component__1c6JC styles_defaultLink__1mFc1 styles_information__1TxGq"]'),
            a => a.getAttribute('href'),
        ),
    );
    elements = _.uniq(elements);
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
