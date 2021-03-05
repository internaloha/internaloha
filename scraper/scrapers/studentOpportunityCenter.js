import puppeteer from 'puppeteer';
import fs from 'fs';
import Logger from 'loglevel';
import { checkHeadlessOrNot, startBrowser } from './scraper-functions.js';

export async function main(headless) {
  let browser;
  let page;
  const data = [];
  Logger.enableAll();
  try {
    Logger.info('Executing script...');
    [browser, page] = await startBrowser(headless);
    await page.goto('https://app.studentopportunitycenter.com/auth/login');
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
