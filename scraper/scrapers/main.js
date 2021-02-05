import Logger from 'loglevel';
import acm from './acm.js';
import apple from './apple.js';

const myArgs = process.argv.slice(2).join(' ');

async function getData() {
  const results = [];
  results.push(apple());
  results.push(acm());
  return Promise.all(results);
}

async function main() {

  console.log(myArgs);

  if (myArgs === 'dev' || myArgs.length === 0) {
    Logger.enableAll();
  } else if (myArgs === 'production') {
    Logger.setLevel('warn');
  } else {
    console.log('Invalid argument supplied, please use "dev" or "production".');

  }

  await getData();
}

main();
