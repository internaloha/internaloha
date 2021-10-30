//import puppeteer from 'puppeteer-extra';
//import * as randomUserAgent from 'random-useragent';
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
    this.log.info('Run checkRequestHeaders()');
    const screenshotPath = 'headers.test.png';
    await this.page.goto('https://headers.cloxy.net/request.php');
    await this.page.waitForTimeout(5000);
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    this.log.info(`Screenshot at: ${screenshotPath}`);
  }

  async login() {
    await super.login();
    // if you need to login, put that code here.
  }

  // https://github.com/berstend/puppeteer-extra/blob/master/packages/puppeteer-extra-plugin-stealth/stealthtests/headless-chromium-stealth.js
  // https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth#usage
  async stealthUsage() {
    this.log.info('Run stealthUsage()');
    const screenshotPath = 'stealthUsage.test.png';
    await this.page.goto('https://bot.sannysoft.com');
    await this.page.waitForTimeout(5000);
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    this.log.info(`Screenshot at: ${screenshotPath}`);
  }

  async generateListings() {
    await super.generateListings();
    await this.stealthUsage();
    await this.checkRequestHeaders();
  }

  async processListings() {
    await super.processListings();
    // here is where you do any additional processing on the raw data now available in the this.listings field.
  }

}
