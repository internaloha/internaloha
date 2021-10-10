import * as fs from 'fs';
import * as path from 'path';
import { Command, Option } from 'commander';
import { DISCIPLINES } from './disciplines';

// Process the command line arguments. All options are optional.
const program = new Command()
  .addOption(new Option('-l, --log-level <level>', 'Specify logging level')
    .default('warn')
    .choices(['trace', 'debug', 'info', 'warn', 'error']))
  .addOption(new Option('-d, --discipline <discipline>', 'Specify what types of internships to find')
    .default(DISCIPLINES.CompSci)
    .choices(Object.values(DISCIPLINES)))
  .option('-sd, --statistics-dir <statisticsdir>', 'Set the directory to hold statistics files.', './statistics')
  .parse(process.argv);
const options = program.opts();

// Uncomment the following line to verify the CLI option values.
// console.log('cli options:', options);

// const directory = `${options.statisticsDir}/${options.discipline}`;
const directory = path.join(options.statisticsDir, options.discipline);

const statisticsFiles = fs.readdirSync(directory).filter(file => path.extname(file) === '.json');
const statistics = [];

// Initialize the statistics array with all statistics in the statistics dir.
statisticsFiles.forEach(file => {
  const fileData = fs.readFileSync(path.join(directory, file));
  statistics.push(JSON.parse(fileData.toString()));
});
console.log(statistics);

// Goal Format: [{scraper: <name1>, <date1>: <numListings1>, <date2>: <numListings2>} ... ]
// Intermediate format: { <name1> : { scraper: <name1>, <date1>: <numListings1>, <date2>: <numListings2>} ...}

// const info = {};

// const { parse } = require('json2csv');

// extract the dates in order to compute the fields.
// const fields = ['scraper', 'num', 'field3'];
// const opts = { fields };
// try {
//   const csv = parse(myData, opts);
//   console.log(csv);
// } catch (err) {
//   console.error(err);
// }
