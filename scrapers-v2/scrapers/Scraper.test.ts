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
    const screenshotPath = 'test-headers.test.png';
    await super.goto('https://headers.cloxy.net/request.php');
    await this.page.waitForTimeout(5000);
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    this.log.info(`Screenshot at: ${screenshotPath}`);
  }

  async checkStealthUsage() {
    this.log.info('Run checkStealthUsage()');
    const screenshotPath = 'test-stealthUsage.test.png';
    await super.goto('https://bot.sannysoft.com');
    await this.page.waitForTimeout(5000);
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    this.log.info(`Screenshot at: ${screenshotPath}`);
  }

  async checkBrowserFingerPrint() {
    this.log.info('Run checkBrowserFingerPrint()');
    const screenshotPath = 'test-browserFingerPrint.test.png';
    await super.goto('https://niespodd.github.io/browser-fingerprinting/');
    await this.page.waitForTimeout(3000);
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    this.log.info(`Screenshot at: ${screenshotPath}`);
  }

  /** Script adapted from https://bot.incolumitas.com/, click on "Use Puppeteer" */
  async checkBotChallenge() {
    this.log.info('Run checkBotChallenge()');
    const screenshotPath = 'test-botChallenge.test.png';
    await super.goto('https://bot.incolumitas.com/');
    // wait for form to appear on page
    await this.page.waitForSelector('#formStuff');
    // overwrite the existing text by selecting it with the mouse with a triple click
    const userNameInput = await this.page.$('[name="userName"]');
    await userNameInput.click({ clickCount: 3 });
    await userNameInput.type('Intern Aloha');
    const emailInput = await this.page.$('[name="eMail"]');
    await super.randomWait();
    await emailInput.click({ clickCount: 3 });
    await emailInput.type('internaloha@gmail.com');
    await this.page.select('[name="cookies"]', 'I want all the Cookies');
    await super.randomWait();
    await this.page.click('#smolCat');
    await super.randomWait();
    await this.page.click('#bigCat');
    await super.randomWait();
    await this.page.click('#submit');
    // handle the dialog
    this.page.on('dialog', async dialog => { await dialog.accept(); });
    // wait for results to appear
    await this.page.waitForSelector('#tableStuff tbody tr .url');
    await super.randomWait();
    // update form
    await this.page.waitForSelector('#updatePrice0');
    await super.randomWait();
    await this.page.click('#updatePrice0');
    await this.page.waitForFunction('!!document.getElementById("price0").getAttribute("data-last-update")');
    await this.page.waitForSelector('#updatePrice1');
    await super.randomWait();
    await this.page.click('#updatePrice1');
    await this.page.waitForFunction('!!document.getElementById("price1").getAttribute("data-last-update")');

    // now scrape the response
    let data = await this.page.evaluate(function () {
      let results = [];
      document.querySelectorAll('#tableStuff tbody tr').forEach((row) => {
        results.push({
          name: row.querySelector('.name')['innerText'],
          price: row.querySelector('.price')['innerText'],
          url: row.querySelector('.url')['innerText'],
        });
      });
      return results;
    });

    this.log.debug(data);
    await this.page.waitForTimeout(7000); // wait for behavioral score to arrive.
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    this.log.info(`Screenshot at: ${screenshotPath}`);
  }

  async checkProxyVPN() {
    this.log.info('Run checkProxyVPN()');
    const screenshotPath = 'test-proxyvpn.test.png';
    await super.goto('https://bot.incolumitas.com/proxy_detect.html');
    await this.page.waitForTimeout(5000);
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    this.log.info(`Screenshot at: ${screenshotPath}`);
  }

  /** Run the tests as part of generateListings. */
  async generateListings() {
    await this.checkStealthUsage();
    await this.checkRequestHeaders();
    await this.checkBrowserFingerPrint();
    await this.checkBotChallenge();
    await this.checkProxyVPN();
  }

}
