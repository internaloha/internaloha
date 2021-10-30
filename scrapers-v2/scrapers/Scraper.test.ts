import puppeteer from 'puppeteer-extra';
import * as randomUserAgent from 'random-useragent';
import { Scraper } from './Scraper';

const prefix = require('loglevel-plugin-prefix');

/**
 * Test Scraper is a scraper you can use to fiddle around with. For example, if you're trying to understand request
 * headers or something and you don't want to edit a production scraper.
 */
export class TestScraper extends Scraper {
  constructor() {
    super({ name: 'test', url: 'https://headers.cloxy.net/request.php' });
  }

  async launch() {
    await super.launch();
    prefix.apply(this.log, { nameFormatter: () => this.name.toUpperCase() });
    this.log.warn(`Launching ${this.name.toUpperCase()} scraper`);
  }

  async checkRequestHeaders() {
    this.log.info((await this.page.goto('https://example.org/')).request().headers());
    await this.page.goto(this.url);
    await this.page.waitForTimeout(100000);
  }

  async login() {
    await super.login();
    // if you need to login, put that code here.
  }

  // https://github.com/berstend/puppeteer-extra/blob/master/packages/puppeteer-extra-plugin-stealth/stealthtests/headless-chromium-stealth.js
  async stealthTest() {
    const screenshotPath = 'stealthTest.test.png';
    this.log.info('Run stealthtest');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 600 });
    await page.goto('https://bot.sannysoft.com/');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    await browser.close();
    this.log.info(`Screenshot at:, ${screenshotPath}`);
  }

  async stealthTest2() {
    const screenshotPath = 'stealthTest2.test.png';
    this.log.info('Run stealthtest2');
    const browser = await puppeteer.launch({ headless: this.headless, devtools: this.devtools, slowMo: this.slowMo });
    const context = await this.browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    await page.setViewport({ width: this.viewportWidth, height: this.viewportHeight });
    await page.setUserAgent(randomUserAgent.getRandom());
    await page.setDefaultTimeout(this.defaultTimeout);
    await page.goto('https://bot.sannysoft.com/');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await browser.close();
    this.log.info(`Screenshot at: ${screenshotPath}`);
  }

  // https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth#usage
  async stealthUsage() {
    const screenshotPath = 'stealthUsage.test.png';
    this.log.info('Run stealthUsage');
    await this.page.goto('https://bot.sannysoft.com');
    await this.page.waitForTimeout(5000);
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    this.log.info(`Screenshot at: ${screenshotPath}`);
  }

  async generateListings() {
    await super.generateListings();
    await this.stealthUsage();
  }

  async processListings() {
    await super.processListings();
    // here is where you do any additional processing on the raw data now available in the this.listings field.
  }

}
