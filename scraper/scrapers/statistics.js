import fs from 'fs';
import pkg from 'lodash';
import Logger from 'loglevel';
import path from 'path';

const { _ } = pkg;

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
  const files = fromDir('../src/src/data/', '.json');
  let data = [];
  const statistics = [];
  for (let i = 0; i < files.length; i++) {
    Logger.info('Parsing:', files[i]);
    const text = JSON.parse(fs.readFileSync(files[i], 'utf8'));
    data = _.concat(data, text);
    let fileName = files[i].match(/([[a-zA-Z-])+/g);
    fileName = fileName[3];
    if (fileName !== 'statistics') {
      statistics.push(getStatistics(fileName, text));
    }
  }
  statistics.push(getStatistics('Total', data));

  fs.writeFile('../src/src/data/statistics.data.json',
    JSON.stringify(statistics, null, 4), 'utf-8',
    err => (err ? console.log('\nData not written!', err) :
      Logger.info('\nData successfully written!')));
}

main();
