import _ from 'lodash';
import linkedinData from './data/linkedin.parsed.data';
import simplyData from './data/simplyhired.parsed.data';
import zipData from './data/ziprecruiter.parsed.data';
import cheggData from './data/internships.parsed.data';
import monsterData from './data/monster.parsed.data';
import youternData from './data/youtern.parsed.data';
import nsfData from './data/nsf-reu.parsed.data';
import iHire from './data/iHireTech.parsed.data';
import glassData from './data/glassdoor.parsed.data';
import indeedData from './data/indeed.parsed.data';
import angelData from './data/angellist.parsed.data';
import manualData from './data/manualInput.parsed.data';
import apple from './data/apple.parsed.data';
import aexpress from './data/aexpress.parsed.data';
import ACM from './data/acm.parsed.data';
import stackoverflow from './data/stackoverflow.parsed.data';
import idealist from './data/idealist.parsed.data';
import coolworks from './data/coolworks.parsed.data';

class RecommendationSystems {
  /* Returns total number of internship listing */
  total = (data) => data.length;

  mergeData() {
    let data = [];
    data = _.concat(zipData, simplyData);
    data = _.concat(data, cheggData);
    data = _.concat(data, monsterData);
    data = _.concat(data, linkedinData);
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
    return data;
  }

  tdfFrequency(data) {
    const skills = _.map(data, 'skills');
    // eslint-disable-next-line global-require
    const natural = require('natural');
    const TfIdf = natural.TfIdf;
    const tfidf = new TfIdf();
    tfidf.addDocument(skills);
    tfidf.tfidfs('python', function (i, measure) {
      console.log(`document${i} is ${measure}`);
    });
  }

}
export default RecommendationSystems;
