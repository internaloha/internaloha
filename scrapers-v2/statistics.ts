import * as fs from 'fs';
import * as path from 'path';
import { Command, Option } from 'commander';
import { DISCIPLINES } from './disciplines';

const { parse } = require('json2csv');

// Process the command line arguments. All options are optional.
const program = new Command()
  .addOption(new Option('-l, --log-level <level>', 'Specify logging level')
    .default('warn')
    .choices(['trace', 'debug', 'info', 'warn', 'error']))
  .addOption(new Option('-d, --discipline <discipline>', 'Specify what types of internships to find')
    .default(DISCIPLINES.CompSci)
    .choices(Object.values(DISCIPLINES)))
  .option('-sd, --statistics-dir <statisticsdir>', 'Set the directory to hold statistics files.', './statistics')
  .option('-cf, --commit-files', 'Write listing and statistic files that are not git-ignored.', false)
  .parse(process.argv);
const options = program.opts();

// Uncomment the following line to verify the CLI option values.
// console.log('cli options:', options);

// const directory = `${options.statisticsDir}/${options.discipline}`;
const directory = path.join(options.statisticsDir, options.discipline);

const statisticsFiles = fs.readdirSync(directory).filter(file => (path.extname(file) === '.json') && (!path.basename(file).endsWith('dev.json')));
const statistics = [];

// Initialize the statistics array with all statistics in the statistics dir.
statisticsFiles.forEach(file => {
  const fileData = fs.readFileSync(path.join(directory, file));
  statistics.push(JSON.parse(fileData.toString()));
});
// console.log(statistics);

// Goal Format: [{scraper: <name1>, <date1>: <numListings1>, <date2>: <numListings2>} ... ]
// Create intermediate format: { <name1> : { scraper: <name1>, <date1>: <numListings1>, <date2>: <numListings2>} ...}
const numListingsInfo = {};
const numErrorsInfo = {};
const elapsedTimeInfo = {};

statistics.forEach(statistic => {
  const name = statistic['scraper'];
  const date = statistic['date'];
  const numListings = statistic['numListings'];
  const numErrors = statistic['numErrors'];
  const elapsedTime = (parseInt(statistic['elapsedTime'], 10) / 60).toFixed(1);

  if (!numListingsInfo[name]) {
    numListingsInfo[name] = {};
    numErrorsInfo[name] = {};
    elapsedTimeInfo[name] = {};
    numListingsInfo[name]['scraper'] = name;
    numErrorsInfo[name]['scraper'] = name;
    elapsedTimeInfo[name]['scraper'] = name;
  }
  numListingsInfo[name][date] = numListings;
  numErrorsInfo[name][date] = numErrors;
  elapsedTimeInfo[name][date] = elapsedTime;
});

// console.log(numListingsInfo);

// Returns an array of date fields in reverse chronological order.
function getDateFields(infoObject) {
  const scraperRowData = Object.values(infoObject);
  let dateFields = [];
  scraperRowData.forEach(rowObject => dateFields.push(Object.keys(rowObject)));
  dateFields = dateFields.flat();
  dateFields = dateFields.filter(element => element !== 'scraper');
  let unique = [...new Set(dateFields)];
  return unique.sort().reverse();
}

// Provide the fields to parse() where dates are in reverse chronological order
const fields = ['scraper'].concat(getDateFields(numListingsInfo));

function writeFile(name, data) {
  const csv = parse(Object.values(data), { quote: '', fields });
  const suffix = options['commitFiles'] ? 'csv' : 'dev.csv';
  const file = path.join(directory, `statistics.${name}.${suffix}`);
  fs.writeFileSync(file, csv, 'utf-8');
  console.log(`Wrote ${file}.`);
}

writeFile('num-listings', numListingsInfo);
writeFile('num-errors', numErrorsInfo);
writeFile('elapsed-time', elapsedTimeInfo);