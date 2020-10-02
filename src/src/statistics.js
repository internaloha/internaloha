import fs from 'fs';
import { _ } from 'lodash';

import simplyData from './data/simplyhired.parsed.data';
import linkedInData from './data/linkedin.parsed.data';
import zipData from './data/ziprecruiter.parsed.data';
import cheggData from './data/internships.parsed.data';
import monsterData from './data/monster.parsed.data';
import nsfData from './data/nsf-reu.parsed.data';
import youternData from './data/youtern.parsed.data';
import iHire from './data/iHireTech.parsed.data';
import glassData from './data/glassdoor.parsed.data';
import indeedData from './data/indeed.parsed.data';
import angelData from './data/angellist.parsed.data';
import manualData from './data/manualInput.data';
import stackoverflow from './data/stackoverflow.parsed.data';
import idealist from './data/idealist.parsed.data';
import ACM from './data/acm.parsed.data';
// const simplyData = './data/simplyhired.parsed.data');
// const linkedInData = './data/linkedin.parsed.data');
// const zipData = './data/ziprecruiter.parsed.data');
// const cheggData = './data/internships.parsed.data');
// const monsterData = './data/monster.parsed.data');
// const nsfData = './data/nsf-reu.parsed.data');
// const youternData = './data/youtern.parsed.data');
// const iHire = './data/iHireTech.parsed.data');
// const glassData = './data/glassdoor.parsed.data');
// const indeedData = './data/indeed.parsed.data');
// const angelData = './data/angellist.parsed.data');
// const manualData = './data/manualInput.data');
// const stackoverflow = './data/stackoverflow.parsed.data');
// const idealist = './data/idealist.parsed.data');
// const ACM = './data/acm.parsed.data');

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
data = _.concat(zipData, simplyData);
data = _.concat(data, cheggData);
data = _.concat(data, monsterData);
data = _.concat(data, linkedInData);
data = _.concat(data, youternData);
data = _.concat(data, nsfData);
data = _.concat(data, iHire);
data = _.concat(data, glassData);
data = _.concat(data, indeedData);
data = _.concat(data, angelData);
data = _.concat(data, manualData);
data = _.concat(data, stackoverflow);
data = _.concat(data, idealist);
data = _.concat(data, ACM);

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
