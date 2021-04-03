import fs from 'fs';
import pkg from 'lodash';
import Logger from 'loglevel';
import path from 'path';

import pkg2 from 'json-2-csv';

const { json2csv } = pkg2;

const { _ } = pkg;

/**
 * Exports data to CSV file.
 * @param data
 * @param name
 */
function convertToCSV(data, name) {

  let dataObj = [];

  if (fs.existsSync(`./data/csv/${name}.csv`)) {
    dataObj = JSON.parse(fs.readFileSync(`./data/csv/${name}.csv`, 'utf8'));
    console.log(dataObj);
  }

  json2csv(data, (err, csv) => {

    if (err) {
      console.log(`Error exporting ot CSV: ${data} | ${err}`);
      throw err;
    }

    // print CSV string
    console.log(csv);

    // write CSV to a file
    fs.writeFileSync(`./data/csv/${name}.csv`, csv);

  }, { emptyFieldValue: 0 });
}

function getStatistics(name, data) {
  const counts = {
    site: name,
    position: 0,
    company: 0,
    contact: 0,
    location: 0,
    posted: 0,
    due: 0,
    start: 0,
    end: 0,
    compensation: 0,
    qualifications: 0,
    skills: 0,
    remote: 0,
    lastScraped: 'N/A',
    index: 0,
    url: 0,
    description: 0,
  };
  if (data.length !== 0) {
    for (let i = 0; i < data.length; i++) {
      Object.keys(data[i]).forEach(function (key) {
        if (key !== 'site') { // account for custom 'Total' key
          if (key === 'skills' || key === 'compensation') {
            if (data[i][key] && data[i][key].length > 0) {
              counts[key]++;
            }
          } else if (key === 'remote') {
            if (data[i][key] && data[i][key] === true) {
              counts[key]++;
            }
          } else if (data[i][key] && data[i][key] !== 'Error') {
            counts[key]++;
          }
        }
      });
    }
    if ('lastScraped' in data[0]) {
      counts.lastScraped = data[0].lastScraped;
    }
  }
  return counts;
}

function fromDir(startPath, filter) {

  let results = [];
  if (!fs.existsSync(startPath)) {
    Logger.error('no dir ', startPath);
    return [];
  }
  const files = fs.readdirSync(startPath);
  for (let i = 0; i < files.length; i++) {
    const filename = path.join(startPath, files[i]);
    const stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      results = results.concat(fromDir(filename, filter)); // recurse
    } else if (filename.indexOf(filter) >= 0) {
      results.push(filename);
    }
  }
  return results;
}

function main() {
  // gets all file from the directory
  const files = fromDir('../ui/src/data/', '.json');
  let data = [];
  const statistics = [];
  for (let i = 0; i < files.length; i++) {
    Logger.info('Parsing:', files[i]);
    let fileName = files[i].match(/([[a-zA-Z-])+/g);
    fileName = fileName[3];
    if (fileName !== 'statistics') {
      const text = JSON.parse(fs.readFileSync(files[i], 'utf8'));
      data = _.concat(data, text);
      const statisticsData = getStatistics(fileName, text);
      // push to global statistics
      statistics.push(statisticsData);
      // export to csv file
      convertToCSV(statisticsData, fileName);
    }
  }
  statistics.push(getStatistics('Total', data));

  fs.writeFile('../ui/src/data/statistics.data.json',
    JSON.stringify(statistics, null, 4), 'utf-8',
    err => (err ? console.log('\nData not written!', err) :
      Logger.info('Data successfully written!')));
}

if (process.argv.includes('main')) {
  main();
}

export default main;
