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

const myArgs = process.argv.slice(2);

/**
 *
 * @param browser: Default: true (do not open up browser)
 * @returns {Promise<unknown[]>}
 */
async function getData(headless = true) {
  const results = [];
  results.push(apple(headless));
  results.push(acm(headless));
  results.push(aexpress(headless));
  results.push(linkedin(headless));
  results.push(monster(headless));
  results.push(simplyHired(headless));
  results.push(cisco(headless));
  return Promise.all(results);
}

async function main() {
  if (myArgs[0] === 'dev') {
    Logger.enableAll();
    if (myArgs[1] && myArgs[1].toLowerCase() === 'open') {
      await getData(false);
    } else if (myArgs[1] && myArgs[1].toLowerCase() === 'close') {
      await getData(true);
    } else {
      console.log('Invalid argument supplied, please use "dev open", "dev close", or "production');
      process.exit(0);
    }
  } else if (myArgs[0] === 'production') {
    Logger.setLevel('warn');
    await getData(true);
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
