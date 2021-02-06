import fs from 'fs';
import pkg from 'lodash';

const { _ } = pkg;

const statistics = [];

function readFile(file) {
  const rawData = fs.readFileSync(file);
  return JSON.parse(rawData);
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
        if (key === 'skills' || key === 'compensation') {
          if (data[i][key] && data[i][key].length > 0) {
            counts[key]++;
          }
        } else if (data[i][key] && data[i][key] !== 'Error') {
          counts[key]++;
        }
      });
    }
    if ('lastScraped' in data[0]) {
      counts.lastScraped = data[0].lastScraped;
    }
  }
  return counts;
}

const zipData = readFile('../src/src/data/ziprecruiter.parsed.data.json');
const simplyData = readFile('../src/src/data/simplyhired.parsed.data.json');
const monsterData = readFile('../src/src/data/monster.parsed.data.json');
const linkedInData = readFile('../src/src/data/linkedin.parsed.data.json');
const youternData = readFile('../src/src/data/youtern.parsed.data.json');
const iHire = readFile('../src/src/data/iHireTech.parsed.data.json');
const glassData = readFile('../src/src/data/glassdoor.parsed.data.json');
const indeedData = readFile('../src/src/data/indeed.parsed.data.json');
const angelData = readFile('../src/src/data/angellist.parsed.data.json');
const manualData = readFile('../src/src/data/manualInput.parsed.data.json');
const stackoverflow = readFile('../src/src/data/stackoverflow.parsed.data.json');
const idealist = readFile('../src/src/data/idealist.parsed.data.json');
const ACM = readFile('../src/src/data/acm.parsed.data.json');
const apple = readFile('../src/src/data/apple.parsed.data.json');
const coolworks = readFile('../src/src/data/coolworks.parsed.data.json');
const aexpress = readFile('../src/src/data/aexpress.parsed.data.json');

let data = [];
data = _.concat(zipData, simplyData);
data = _.concat(data, monsterData);
data = _.concat(data, linkedInData);
data = _.concat(data, youternData);
data = _.concat(data, iHire);
data = _.concat(data, glassData);
data = _.concat(data, indeedData);
data = _.concat(data, angelData);
data = _.concat(data, manualData);
data = _.concat(data, stackoverflow);
data = _.concat(data, idealist);
data = _.concat(data, ACM);
data = _.concat(data, coolworks);
data = _.concat(data, aexpress);
data = _.concat(data, apple);

statistics.push(
  getStatistics('simplyHired', simplyData),
  getStatistics('LinkedIn', linkedInData),
  getStatistics('ZipRecruiter', zipData),
  getStatistics('Monster', monsterData),
  getStatistics('YouTern', youternData),
  getStatistics('iHireTech', iHire),
  getStatistics('Glassdoor', glassData),
  getStatistics('Indeed', indeedData),
  getStatistics('Idealist', idealist),
  getStatistics('AngelList', angelData),
  getStatistics('Stackoverflow', stackoverflow),
  getStatistics('ACM', ACM),
  getStatistics('Coolworks', coolworks),
  getStatistics('Aexpress', aexpress),
  getStatistics('Apple', apple),
  getStatistics('Manual', manualData),
  getStatistics('Total', data),
);

console.log(statistics);

fs.writeFile('../src/src/data/statistics.data.json',
  JSON.stringify(statistics, null, 4), 'utf-8',
  err => (err ? console.log('\nData not written!', err) :
    console.log('\nData successfully written!')));
