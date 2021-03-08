import Logger from 'loglevel';
import acm from './acm.js';
import apple from './apple.js';
import aexpress from './aexpress.js';
import multi_parse from './multi-parser.js';
import statistics from './statistics.js';
import linkedin from './linkedin.js';
import monster from './monster.js';
import simplyHired from './simplyHired.js';
import cisco from './cisco.js';
import zipRecruiter from './zipRecruiter.js';
import stackoverflow from './stackoverflow.js';
import indeed from './indeed.js';
import idealist from './idealist.js';
import hawaiislack from './hawaiislack.js';
import chegg from './internships.js';
import angellist from './angellist.js';

const myArgs = process.argv.slice(2);

/**
 *
 * @param headless: Default: true (do not open up browser)
 * @returns {Promise<unknown[]>}
 */
async function getAllData(headless = true) {
  const results = [];
  results.push(apple(headless));
  results.push(acm(headless));
  results.push(aexpress(headless));
  results.push(linkedin(headless));
  results.push(monster(headless));
  results.push(simplyHired(headless));
  results.push(cisco(headless));
  results.push(zipRecruiter(headless));
  results.push(stackoverflow(headless));
  results.push(indeed(headless));
  results.push(idealist(headless));
  results.push(hawaiislack(headless));
  return Promise.all(results);
}

/**
 * @param scraperName String Name of the scraper you want to run
 * @param headless Default true (do not open up browser)
 * @returns {Promise<void>}
 */
async function getData(scraperName, headless = true) {
  const list = {
    apple: apple,
    acm: acm,
    aexpress: aexpress,
    linkedin: linkedin,
    monster: monster,
    simplyhired: simplyHired,
    cisco: cisco,
    ziprecruiter: zipRecruiter,
    stackoverflow: stackoverflow,
    indeed: indeed,
    idealist: idealist,
    hawaiislack: hawaiislack,
    chegg: chegg,
    angellist: angellist,
  };
  await list[scraperName](headless);
}

async function main() {
  if (myArgs.length === 3) {
    Logger.enableAll();
    if (myArgs[2] && myArgs[2].toLowerCase() === 'open') {
      await getData(myArgs[0], false);
    } else if (myArgs[2] && myArgs[2].toLowerCase() === 'close') {
      await getData(myArgs[0], true);
    } else {
      console.log('Invalid argument supplied, please use "dev open" or "dev close". For example, npm run scrapers' +
        ' dev open.');
      process.exit(0);
    }
  } else if (myArgs[0] === 'dev') {
    Logger.enableAll();
    if (myArgs[1] && myArgs[1].toLowerCase() === 'open') {
      await getAllData(false);
    } else if (myArgs[1] && myArgs[1].toLowerCase() === 'close') {
      await getAllData(true);
    } else {
      console.log('Invalid argument supplied, please use "dev open", "dev close", or "production');
      process.exit(0);
    }
  } else if (myArgs[0] === 'production') {
    Logger.setLevel('warn');
    await getAllData(true);
  } else {
    console.log('Invalid argument supplied, please use "dev open", "dev close", or "production".');
    process.exit(0);
  }

  Logger.info('Finished scraping!\nNow parsing');
  multi_parse();
  Logger.info('Finished parsing!\nNow getting statistics');
  statistics();
  Logger.info('Completed.');
}

main();
