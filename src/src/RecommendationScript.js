import natural from 'natural';
import _ from 'lodash';
import career_interest_to_skill from './career_interest_to_skill';

function test(data) {
  const TfIdf = natural.TfIdf;
  const tfidf = new TfIdf();

  for (let i = 0; i < data.length; i++) {
    tfidf.addDocument(data[i].description);
  }

  const tfidfData = [];

  // tfidf.addDocument('this document is about node.');
  // tfidf.addDocument('this document is about ruby.');
  // tfidf.addDocument('this document is about ruby and node.');
  // tfidf.addDocument('this document is about node. it has node examples');

  console.log('javascript full-stack css hmtl --------------------------------');

  tfidf.tfidfs('javascript full-stack css hmtl ', function (i, measure) {
    //  console.log('document #' + i + ' is ' + measure);
    if (measure > 6) {
      console.log('document #' + i + ' is ' + measure);
      tfidfData.push(data[i]);
    }
  });

  // console.log(tfidfData);
  return tfidfData;

  // console.log('ruby --------------------------------');
  // tfidf.tfidfs('ruby', function (i, measure) {
  //   console.log('document #' + i + ' is ' + measure);
  // });
}

function dropdownCareerInterest() {

  const info = [];
  for (let i = 0; i < career_interest_to_skill.length; i++) {
    info.push({
      key: career_interest_to_skill[i].career,
      text: career_interest_to_skill[i].career,
      value: career_interest_to_skill[i].career,
    });
  }
  return info;
}

function recommendation(tags, careers, data, location) {

  if (tags.length === 0 && careers.length === 0) {
    if (location.length !== 0) {
      if (location[0] === 'any') {
        return data;
      } else {
        let arrLocations = [];
        for (let i = 0; i < location.length; i++) {
          const newState = _.filter(data, ['location.state', location[i]]);
          arrLocations = arrLocations.concat(newState);
          console.log(arrLocations)
        }
        return arrLocations;
      }
    }
    return data;
  }

  console.log(location);

  const skills = [];

  let careerSkills = [];
  for (let i = 0; i < career_interest_to_skill.length; i++) {
    for (let k = 0; k < careers.length; k++) {
      if (careers[k] === career_interest_to_skill[i].career) {
        for (let j = 0; j < career_interest_to_skill[i].skills.length; j++) {
          careerSkills.push(career_interest_to_skill[i].skills[j]);
        }
      }
    }
  }

  careerSkills = _.uniq(careerSkills);

  // const lowerCaseTags = [];

  // for (let i = 0; i < tags.length; i++) {
  //   lowerCaseTags.push(tags[i].toString().toLowerCase());
  // }

  const totalSkills = _.uniq(careerSkills.concat(tags));

  // console.log(totalSkills);

  for (let i = 0; i < data.length; i++) {
    let foundTag = false;
    let num = 0;
    let total = 0;
    for (let j = 0; j < data[i].skills.length; j++) {
      for (let k = 0; k < totalSkills.length; k++) {
        if (data[i].skills[j].includes(totalSkills[k])) {
          num++;
          foundTag = true;
        }
      }
      total = data[i].skills.length;
    }
    if (foundTag === true) {

      data[i].recommendation = num / total;
      skills.push(data[i]);
    }
  }

  const sorted = _.orderBy(skills, ['recommendation'], ['desc']);

  //console.log(sorted);

// for (let i = 0; i < data.length; i++) {
//   // if any of the tags exist in data set, push it to skills and go to next
//   while (counter < totalSkills.length && exists === false) {
//     if (data[i].skills.includes(totalSkills[counter])) {
//       skills.push(data[i]);
//       exists = true;
//     }
//     counter++;
//   }
//   counter = 0;
//   exists = false;
// }
// console.log(skills);
  console.log(location);

  if (location.length === 0) {
    return sorted;
  }

  // if (location.length === 1) {
  //   return _.filter(sorted, ['location.state', location]);
  // } else {
    let arrLocations = [];
    for (let i = 0; i < location.length; i++) {
      arrLocations = arrLocations.concat(_.filter(sorted, ['location.state', location[i]]));
    }
    return arrLocations;
  // }
  //
  // console.log(sorted);
  // console.log(_.filter(sorted, ['location.state', location]));
  // return _.filter(sorted, ['location.state', location]);

}

function isRemoteFunc(data, value) {
  if (value === false) {
    return data;
  }
  console.log(_.filter(data, ['remote', true]))
  return _.filter(data, ['remote', true]);
}

export { recommendation, dropdownCareerInterest, test, isRemoteFunc };
