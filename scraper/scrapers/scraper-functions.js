import puppeteer from 'puppeteer';
import fs from 'fs';
import Logger from 'loglevel';

/* global window */

/**
 * The behavior of this function is to wait for a selector, and if the waitForSelector times out without finding it, it returns null. Otherwise, it returns true
 * @param page
 * @param selector
 * @returns {Promise<null|boolean>}
 */
async function waitForSelectorIfPresent(page, selector) {
  try {
    await page.waitForSelector(selector, { timeout: 10000 });
  } catch (e) {
    return null;
  }
  return true;
}

/**
 * Fetches the information from the page.
 * @param page The page we are scraping
 * @param selector The CSS Selector
 * @param DOM_Element The DOM element we want to use. Common ones are innerHTML, innerText, textContent
 * @returns {Promise<*>} The information as a String.
 */
async function fetchInfo(page, selector, DOM_Element) {
  let result = await waitForSelectorIfPresent(page, selector);
  if (result) {
    result = await page.evaluate((select, element) => document.querySelector(select)[element], selector, DOM_Element);
  } else {
    // only prints trace when it's not in production
    const oldLevel = Logger.getLevel();
    if (oldLevel !== 3) {
      console.trace('\x1b[4m\x1b[33m%s\x1b[0m', `${selector} does not exist.`);
    }
    result = 'Error';
  }
  return result;
}

/**
 * Scrolls down a specific amount every 4 milliseconds.
 * @param page The page we are scrolling.
 * @returns {Promise<void>}
 */
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 400);
    });
  });
}

/**
 * Checks to see if the data contains the word 'remote'
 * @param data String The data we're checking
 * @returns boolean true if found, else false
 */
function isRemote(data) {
  const parsed = data.replace(/([[\]()-])gmi/, '').toLowerCase();
  return parsed.includes('remote');
}

/**
 *
 * @param headless Default: true (do not open up browser)
 * @param devtools Default: false - opens up devtools
 * @param slowMo Default: 0
 * @returns {Promise<(Browser|Page)[]>}
 */
async function startBrowser(headless = true, devtools = false, slowMo = 0) {
  const browser = await puppeteer.launch({ headless: headless, devtools: devtools, slowMo: slowMo });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9');
  return [browser, page];
}

/**
 * Write to JSON file, saved in /data/canonical/$name/canonical.data.json
 * @param data data object
 * @param name Name of the file
 * @returns {Promise<void>}
 */
async function writeToJSON(data, name) {
  await fs.writeFile(`./data/canonical/${name}.canonical.data.json`,
    JSON.stringify(data, null, 4), 'utf-8',
    err => (err ? Logger.error('\nData not written!', err) :
      Logger.info(`\nData successfully written for ${name}!`)));
}

/**
 * Converts posted strings to ISO format. This is ONLY if it follows the format of:
 * Posted: 4 days ago... 3 weeks ago... a month ago
 * @param posted The string
 * @returns {Date}
 */
function convertPostedToDate(posted) {
  const date = new Date();
  let daysBack = 0;
  if (posted.includes('hours') || (posted.includes('hour')) || (posted.includes('minute'))
    || (posted.includes('minutes')) || (posted.includes('moment')) || (posted.includes('second'))
    || (posted.includes('seconds')) || (posted.includes('today'))) {
    daysBack = 0;
  } else if ((posted.includes('week')) || (posted.includes('weeks'))) {
    daysBack = posted.match(/\d+/g) * 7;
  } else if ((posted.includes('month')) || (posted.includes('months'))) {
    daysBack = posted.match(/\d+/g) * 30;
  } else {
    daysBack = posted.match(/\d+/g);
  }
  date.setDate(date.getDate() - daysBack);
  return date;
}

async function installMouseHelper(page) {
  await page.evaluateOnNewDocument(() => {
    // Install mouse helper only for top-level frame.
    if (window !== window.parent) return;
    window.addEventListener('DOMContentLoaded', () => {
      const box = document.createElement('puppeteer-mouse-pointer');
      const styleElement = document.createElement('style');
      styleElement.innerHTML = `
        puppeteer-mouse-pointer {
          pointer-events: none;
          position: absolute;
          top: 0;
          z-index: 10000;
          left: 0;
          width: 20px;
          height: 20px;
          background: rgba(0,0,0,.4);
          border: 1px solid white;
          border-radius: 10px;
          margin: -10px 0 0 -10px;
          padding: 0;
          transition: background .2s, border-radius .2s, border-color .2s;
        }
        puppeteer-mouse-pointer.button-1 {
          transition: none;
          background: rgba(0,0,0,0.9);
        }
        puppeteer-mouse-pointer.button-2 {
          transition: none;
          border-color: rgba(0,0,255,0.9);
        }
        puppeteer-mouse-pointer.button-3 {
          transition: none;
          border-radius: 4px;
        }
        puppeteer-mouse-pointer.button-4 {
          transition: none;
          border-color: rgba(255,0,0,0.9);
        }
        puppeteer-mouse-pointer.button-5 {
          transition: none;
          border-color: rgba(0,255,0,0.9);
        }
      `;
      document.head.appendChild(styleElement);
      document.body.appendChild(box);
      document.addEventListener('mousemove', event => {
        box.style.left = `${event.pageX}px`;
        box.style.top = `${event.pageY}px`;
        // eslint-disable-next-line no-use-before-define
        updateButtons(event.buttons);
      }, true);
      document.addEventListener('mousedown', event => {
        // eslint-disable-next-line no-use-before-define
        updateButtons(event.buttons);
        box.classList.add(`button-${event.which}`);
      }, true);
      document.addEventListener('mouseup', event => {
        // eslint-disable-next-line no-use-before-define
        updateButtons(event.buttons);
        box.classList.remove(`button-${event.which}`);
      }, true);
      function updateButtons(buttons) {
        // eslint-disable-next-line no-bitwise
        for (let i = 0; i < 5; i++) box.classList.toggle(`button-${i}`, buttons & (1 << i));
      }
    }, false);
  });
}

export { fetchInfo, autoScroll, isRemote, startBrowser, writeToJSON, convertPostedToDate, installMouseHelper };
