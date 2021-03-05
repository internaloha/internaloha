import puppeteer from 'puppeteer';
import fs from 'fs';
import Logger from 'loglevel';
import { checkHeadlessOrNot, startBrowser } from './scraper-functions.js';

const USERNAME_SELECTOR = '#login-email';
const PASSWORD_SELECTOR = '#login-password';
const CTA_SELECTOR = '#login-submit-button';
const credentials = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

async function getData(page) {
  const results = [];
  for (let i = 0; i < 5; i++) {
  
  }
  return Promise.all(results);
}

export async function main(headless) {
  let browser;
  let page;
  const data = [];
  Logger.enableAll();
  try {
    Logger.info('Executing script...');
    [browser, page] = await startBrowser(headless);
    await page.goto('https://app.studentopportunitycenter.com/auth/login');
    await page.click(USERNAME_SELECTOR);
    await page.keyboard.type(credentials.studentOpportunityCenter.user);
    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type(credentials.studentOpportunityCenter.password);
    await page.click(CTA_SELECTOR);
    await page.waitForNavigation();
  } catch (e) {
    Logger.trace('Our Error: ', e.message);
  }
}

if (process.argv.includes('main')) {
  const headless = checkHeadlessOrNot(process.argv);
  if (headless === -1) {
    Logger.error('Invalid argument supplied, please use "open", or "close"');
    process.exit(0);
  }
  main(headless);
}

export default main;
