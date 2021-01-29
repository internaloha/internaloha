import fs from 'fs';
import pkg from 'lodash';

const { _ } = pkg;

const statistics = [];

function readFile(file) {
  const rawData = fs.readFileSync(file);
  return JSON.parse(rawData);
}

function getStatistics(name, data) {
  let list = [];
  let position = 0;
  let company = 0;
  let contact = 0;
  let location = 0;
  let posted = 0;
  let due = 0;
  let start = 0;
  let end = 0;
  let compensation = 0;
  let qualifications = 0;
  let description = 0;
  let skills = 0;
  let remote = 0;
  console.log(name);
  let lastScraped = 0;
  try {
    lastScraped = data[0].lastScraped;
  } catch (err2) {
    lastScraped = 'Error';
  }

  for (let i = 0; i < data.length; i++) {
    if ((data[i].position) && data[i].position !== 'Error') {
      position++;
    }
    if (data[i].company && data[i].position !== 'Error') {
      company++;
    }
    if (data[i].contact) {
      contact++;
    }
    if (data[i].location) {
      location++;
    }
    if (data[i].posted) {
      posted++;
    }
    if (data[i].due) {
      due++;
    }
    if (data[i].start) {
      start++;
    }
    if (data[i].end) {
      end++;
    }
    if (data[i].compensation && data[i].compensation.length > 0) {
      compensation++;
    }
    if (data[i].qualifications) {
      qualifications++;
    }
    if (data[i].remote) {
      remote++;
    }
    if (data[i].description && data[i].position !== 'Error') {
      description++;
    }
    if ((data[i].skills) && (data[i].skills.length > 0)) {
      skills++;
    }
  }

  list = {
    site: name,
    lastScraped: lastScraped,
    entries: data.length,
    position: position,
    company: company,
    contact: contact,
    location: location,
    posted: posted,
    due: due,
    start: start,
    end: end,
    compensation: compensation,
    qualifications: qualifications,
    skills: skills,
    description: description,
    remote: remote,
  };

  return list;
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
    // getStatistics('Chegg Internships', cheggData),
    getStatistics('Monster', monsterData),
    // getStatistics('NSF-REU', nsfData),
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
