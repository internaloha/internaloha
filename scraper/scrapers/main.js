import Logger from 'loglevel';
import acm from './acm.js';
import apple from './apple.js';
import aexpress from './aexpress.js';
import multi_parse from './multi-parser.js';
import statistics from './statistics.js';

const myArgs = process.argv.slice(2).join(' ');

async function getData() {
  const results = [];
  results.push(apple());
  results.push(acm());
  results.push(aexpress());
  return Promise.all(results);
}

async function main() {

  if (myArgs === 'dev' || myArgs.length === 0) {
    Logger.enableAll();
  } else if (myArgs === 'production') {
    Logger.setLevel('warn');
  } else {
    console.log('Invalid argument supplied, please use "dev" or "production".');
  }

  await getData();
  Logger.info('Finished scraping!\nNow parsing');
  multi_parse();
  Logger.info('Finished parsing!\nNow getting statistics');
  statistics();
  Logger.info('Completed.');
}

main();
