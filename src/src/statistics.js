const fs = require('fs');
const lodash = require('lodash');
const simplyData = require('./data/simplyhired.parsed.data');
const linkedInData = require('./data/linkedin.parsed.data');
const zipData = require('./data/ziprecruiter.parsed.data');
const cheggData = require('./data/internships.parsed.data');
const monsterData = require('./data/monster.parsed.data');
const nsfData = require('./data/nsf-reu.parsed.data');
const youternData = require('./data/youtern.parsed.data');
const iHire = require('./data/iHireTech.parsed.data');
const glassData = require('./data/glassdoor.parsed.data');
const indeedData = require('./data/indeed.parsed.data');
const angelData = require('./data/angellist.parsed.data');
const manualData = require('./data/manualInput.data');
const stackoverflow = require('./data/stackoverflow.parsed.data');
const idealist = require('./data/idealist.parsed.data');
const ACM = require('./data/acm.parsed.data');

const statistics = [];

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
  const lastScraped = data[0].lastScraped;

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
  };

  return list;
}

let data = [];
data = lodash.concat(zipData, simplyData);
data = lodash.concat(data, cheggData);
data = lodash.concat(data, monsterData);
data = lodash.concat(data, linkedInData);
data = lodash.concat(data, youternData);
data = lodash.concat(data, nsfData);
data = lodash.concat(data, iHire);
data = lodash.concat(data, glassData);
data = lodash.concat(data, indeedData);
data = lodash.concat(data, angelData);
data = lodash.concat(data, manualData);
data = lodash.concat(data, stackoverflow);
data = lodash.concat(data, idealist);
data = lodash.concat(data, ACM);

statistics.push(
    getStatistics('simplyHired', simplyData),
    getStatistics('LinkedIn', linkedInData),
    getStatistics('ZipRecruiter', zipData),
    getStatistics('Chegg Internships', cheggData),
    getStatistics('Monster', monsterData),
    getStatistics('NSF-REU', nsfData),
    getStatistics('YouTern', youternData),
    getStatistics('iHireTech', iHire),
    getStatistics('Glassdoor', glassData),
    getStatistics('Indeed', indeedData),
    getStatistics('Idealist', idealist),
    getStatistics('AngelList', angelData),
    getStatistics('Stackoverflow', stackoverflow),
    getStatistics('ACM', ACM),
    getStatistics('Manual', manualData),
    getStatistics('Total', data),
);

console.log(statistics);

fs.writeFile('src/data/statistics.data.json',
    JSON.stringify(statistics, null, 4), 'utf-8',
    err => (err ? console.log('\nData not written!', err) :
        console.log('\nData successfully written!')));
