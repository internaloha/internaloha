import _ from 'lodash';
import natural from 'natural';
import skillList from './Skills';

function recommendation(tags, data) {
  const TfIdf = natural.TfIdf;
  const tfidf = new TfIdf();

  for (let i = 0; i < data.length; i++) {
    tfidf.addDocument(data[i].description);
  }

  const skillFrequency = [];
  for (let i = 0; i < skillList[0].skills.length; i++) {
    tfidf.tfidfs(`${skillList[0].skills[i]}`, function (j, measure) {
      if (measure > 0) {
        skillFrequency.push({
          skills: skillList[0].skills[i],
          frequency: measure,
        });
      }
    });
  }

  const skills = [];
  for (let i = 0; i < data.length; i++) {
    let totalFrequency = 0;
    for (let j = 0; j < skillFrequency.length; j++) {
      for (let k = 0; k < tags.length; k++) {
        if (tags[k] === skillFrequency[j].skills) {
          totalFrequency += skillFrequency[j].frequency;
        }
      }
    }
    // eslint-disable-next-line no-param-reassign
    data[i].totalFrequency = totalFrequency;
    skills.push(data[i]);
  }
  const priority = _.orderBy(skills, ['totalFrequency'], ['desc']);
  return priority;
}

export { recommendation };
