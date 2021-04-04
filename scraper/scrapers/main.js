import Logger from 'loglevel';
import pkg2 from 'json-2-csv';
import commandLineUsage from 'command-line-usage';
import fs from 'fs';
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
import glassdoor from './glassdoor.js';
import nsf_reu from './nsf-reu.js';

const myArgs = process.argv.slice(2);

const optionDefinitions = [
  {
    name: 'unattended',
    description: 'Runs all the unattended scrapers in production mode',
    typeLabel: '...',
  },
  {
    name: 'statistics',
    description: 'Saves the statistics CSV file. It only works in production mode.',
    typeLabel: '...',
  },
  {
    name: 'dev',
    description: 'Runs all the scrapers in development mode. Valid option: open (opens browsers), closed (doesn\'t' +
      ' open' +
      ' up browsers)',
    type: String,
    multiple: true,
    defaultOption: true,
    typeLabel: '{underline option}',
  },
  {
    name: 'dev',
    description: 'Runs [scraper] in development mode. Valid option: open (opens browsers), closed (doesn\'t open' +
      ' up browsers)',
    type: String,
    multiple: true,
    defaultOption: true,
    typeLabel: '{underline scraper} {underline option}',
  },
];

const sections = [
  {
    header: 'Error',
    content: `An error was thrown when trying to run 'npm run scrapers ${process.argv.slice(2)}'. Please refer to the guide below to see the specifications.`,
  },
  {
    header: 'Synopsis',
    content: [
      'Script Format: $ npm run scrapers [<name>|unattended] [dev|prod] [open|closed]',
      'Default is "prod" and "closed". ',
    ],
  },
  {
    header: 'Options',
    optionList: optionDefinitions,
  },
  {
    header: 'Examples',
    content: [
      {
        desc: '1. Running scraper in production.',
        example: '$ npm run scrapers unattended',
      },
      {
        desc: '2. Running scraper in production and saves statistics in CVS file.',
        example: '$ npm run scrapers unattended --save statistics',
      },
      {
        desc: '3. Running a scraper individually (eg. linkedin) with the browser closed. ',
        example: '$ npm run scrapers linkedin, $ npm run scrapers linkedin dev closed',
      },
      {
        desc: '4. Running a scraper individually (eg. linkedin) with the browser open.',
        example: '$ npm run scrapers linkedin dev open',
      },
    ],
  },
  {
    content: 'Detailed Documentation: {underline' +
      ' https://internaloha.github.io/documentation/docs/developers/scrapers/running}',
  },
];

const usage = commandLineUsage(sections);

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
  results.push(indeed(headless));
  results.push(idealist(headless));
  results.push(hawaiislack(headless));
  results.push(glassdoor(headless));
  results.push(nsf_reu(headless));
  results.push(stackoverflow(headless));
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
    glassdoor: glassdoor,
    nsf_reu: nsf_reu,
  };
  try {
    await list[scraperName](headless);
  } catch (e) {
    console.log(usage);
    process.exit(0);
  }
}

/**
 * Converts json object to CSV
 * @param data
 * @param fileExists - if the file already exists. Default: false
 */
function convertToCVS(data, fileExists = false) {
  const { json2csv } = pkg2;
  let fileName;
  const savedData = data;
  if (fileExists) {
    fileName = savedData[savedData.length - 1].site;
    delete savedData[savedData.length - 1].site;
  } else {
    fileName = savedData.site;
    delete savedData.site;
  }
  json2csv(savedData, (error, csv) => {
    if (error) {
      throw error;
    }
    // check if file exists
    fs.writeFileSync(`./data/csv/${fileName}.csv`, csv);
  }, { trimHeaderFields: true, checkSchemaDifferences: true });
}

/**
 * Exports data to CSV file.
 * @param data
 * @param name
 */
function exportToCSV() {
  const { csv2json } = pkg2;
  fs.readFile('../ui/src/data/statistics.data.json', (err, data) => {
    if (err) {
      throw err;
    }
    const statisticData = JSON.parse(data.toString());
    for (let i = 0; i < statisticData.length; i++) {
      const site = statisticData[i];
      try {
        if (site.site !== 'Total') {
          if (fs.existsSync(`./data/csv/${site.site}.csv`)) {
            const csvString = (fs.readFileSync(`./data/csv/${site.site}.csv`, 'utf8'));
            csv2json(csvString, (error2, jsonObjs) => {
              if (error2) {
                throw error2;
              }
              jsonObjs.push(site);
              convertToCVS(jsonObjs, true);
            }, { trimHeaderFields: true });
          } else {
            convertToCVS(site);
          }
        }
      } catch (e5) {
        console.log(`Error exporting to CSV: ${site.site} | ${e5}`);
      }
    }
  });
}

async function main() {
  process.setMaxListeners(0);

// default is running in production (doesn't open browsers)
  if (myArgs.length === 0 || myArgs[0] === 'prod' || myArgs[0] === 'unattended' || myArgs[0] === 'statistics') {
      Logger.setLevel('warn');
      await getAllData(true);
// npm run dev [open|close], default is it doesn't up browsers
  } else if (myArgs[0] === 'dev') {
    Logger.enableAll();
    if (myArgs[1] && myArgs[1].toLowerCase() === 'open') {
      await getAllData(false);
    } else if (myArgs[1] && myArgs[1].toLowerCase() === 'close') {
      await getAllData(true);
    } else {
      // default for npm run dev is it doesn't open browsers
      await getAllData(true);
    }
  } else if (myArgs[0] !== 'dev' && myArgs.length === 1) {
    Logger.enableAll();
    await getData(myArgs[0], true);
// eg. npm run acm dev open (default is close)
  } else if (myArgs.length === 3) {
      Logger.enableAll();
      if (myArgs[2] && myArgs[2].toLowerCase() === 'open') {
        await getData(myArgs[0], false);
      } else if (myArgs[2] && myArgs[2].toLowerCase() === 'close') {
        await getData(myArgs[0], true);
      } else {
        await getData(myArgs[0], true);
      }
  } else {
    console.log(usage);
    process.exit(0);
  }
  Logger.info('Finished scraping!\nNow parsing');
  multi_parse();
  Logger.info('Finished parsing!\nNow getting statistics');
  statistics();
  Logger.info('Finished getting statistics.');
  if (process.argv.includes('statistics')) {
    Logger.info('Now saving data to CSV files.');
    exportToCSV();
  }
  Logger.info('Completed.');
}

main();
