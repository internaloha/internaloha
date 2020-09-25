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

class InternshipsFilters {

  /**
   * Returns total number of internship listing
   * @param data
   * @returns {*} Returns total number of internship listing
   */
  total = (data) => data.length;

  /**
   * Combines all the internship data into 1
   * @returns {Array} All the internship data
   */
  mergeData() {
    let data = [];
    data = _.concat(zipData, simplyData);
    data = _.concat(data, cheggData);
    data = _.concat(data, monsterData);
    data = _.concat(data, linkedinData);
    data = _.concat(data, youternData);
    data = _.concat(data, nsfData);
    data = _.concat(data, iHire);
    data = _.concat(data, glassData);
    data = _.concat(data, indeedData);
    data = _.concat(data, angelData);

    // console.log('zip:', zipData.length);
    // console.log('simply:', simplyData.length);
    // console.log('chegg:', cheggData.length);
    // console.log('monster:', monsterData.length);
    // console.log('linkedIn:', linkedinData.length);
    // console.log('total:', data.length);
    // let test = _.map(linkedinData, 'company');
    // console.log(test.sort());
    //
    // let test2 = _.map(angelData, 'location.state');
    //console.log(_.groupBy(test2));
    //console.log(_.filter(angelData, ['location.state', '']));
    return data;
  }

  /* Format:
  * key: unique key of the company
  * text: Text that shows up in dropdown
  * value: value used to search
  * num: the number of internships with said company */
  /**
   * Returns array of companies for us to be able to pass into semantic ui's dropdown.
   * @param data The information being passed
   * @returns {[]} Returns array of companies for us to be able to pass into semantic ui's dropdown.
   */
  dropdownCompany(data) {
    let companies = _.map(data, 'company');
    const categories = _.flattenDeep(companies);
    companies = _.uniq(categories).sort();

    const number = _.groupBy(data, 'company');
    const info = [];

    for (let i = 0; i < companies.length; i++) {
      info.push({
        key: companies[i],
        text: `${companies[i]} (${number[companies[i]].length})`,
        value: companies[i],
        num: number[companies[i]].length,
      });
    }

    // Adding any parameter to front of array
    info.unshift({
      key: 'any',
      text: 'Any',
      value: 'any',
    });

    return info;
  }

  /* Format:
 * key: unique key of the company
 * text: Text that shows up in dropdown
 * value: value used to search
 * num: the number of internships with said company */
  /**
   * Returns array of companies for us to be able to pass into semantic ui's dropdown.
   * @param The information being passed
   * @returns {[]} Array of companies for us to be able to pass into semantic ui's dropdown.
   */
  dropdownLocation(data) {
    let location = _.map(data, 'location.state');
    // console.log(location);
    const categories = _.flattenDeep(location);
    location = _.uniq(categories).sort();
    // console.log(location);

    const number = _.groupBy(data, 'location.state');
    const info = [];

    for (let i = 0; i < location.length; i++) {
      info.push({
        key: location[i],
        text: `${location[i]} (${number[location[i]].length})`,
        value: location[i],
        num: number[location[i]].length,
      });
    }

    // Adding any parameter to front of array
    info.unshift({
      key: 'any',
      text: 'Any',
      value: 'any',
    });

    return info;
  }

  /* Format:
* key: unique key of the skill
* text: Text that shows up in dropdown
* value: value used to search
* num: the number of internships with the associated skills */
  /**
   * Returns array of skills for us to be able to pass into semantic ui's dropdown.
   * @returns {[]} Returns array of skills for us to be able to pass into semantic ui's dropdown.
   */
  dropdownSkills() {

    // get skills for each position
    const skills = _.map(this.mergeData(), 'skills');

    // flatten so it's just 1 array
    const flattenSkills = _.flattenDeep(skills);

    // map through skills and convert them to lowercase
    let uniqueSkills = flattenSkills.map(skill => skill.toLowerCase());
    // console.log(_.groupBy(uniqueSkills));

    // group the skills (Eg. java: [java, java, java...]
    const number = _.groupBy(uniqueSkills);

    // Only show the skills once so no repeat
    uniqueSkills = _.uniq(uniqueSkills);

    const info = [];

    for (let i = 0; i < uniqueSkills.length; i++) {
        info.push({
          key: uniqueSkills[i],
          text: `${uniqueSkills[i]} (${number[uniqueSkills[i]].length})`,
          value: uniqueSkills[i],
          num: number[uniqueSkills[i]].length,
        });
      }
    return info;
  }


  /**
   * Sorts the data by given parameters
   * @param data Data we want to sort
   * @param String How we want to sort it. (Date/Company)
   * @returns {Array} Sorted data
   */
  sortedBy(data, value) {
    if (value === 'date') {
      return _.orderBy(data, ['posted'], ['desc']);
    }
    if (value === 'company') {
      return _.orderBy(data, ['company'], ['asc']);
    }
    return _.orderBy(data, ['position'], ['asc']);
  }

  /**
   * Returns a list based on skill/tags inputs
   * @param data Data we want to sort
   * @param The skill the user selected
   * @returns {Array} An array based off the user selection
   */
  filterBySkills(data, tags) {
    if (tags.length === 0) {
      return data;
    }

    const skills = [];
    let exists = false;
    let counter = 0;
    for (let i = 0; i < data.length; i++) {
      // if any of the tags exist in data set, push it to skills and go to next
        while (counter < tags.length && exists === false) {
          const skillLowerCase = data[i].skills.toString().toLowerCase();
          if (skillLowerCase.includes(tags[counter])) {
            skills.push(data[i]);
            exists = true;
          }
          counter++;
      }
      counter = 0;
      exists = false;
    }
    return skills;
  }

  /* Returns a sorted list by company name */
  /**
   * Returns a list based on company selected
   * @param data Data we want to sort
   * @param The company the user selected
   * @returns {Array} An array based off the user selection
   */
  filterByCompany(data, company) {
    if (company === 'any') {
      return data;
    }
    return _.filter(data, ['company', company]);
  }

  /**
   * Returns a list based on search query of TITLE
   * @param data Data we want to sort
   * @param The location the user selected
   * @returns {Array} An array based off the user selection
   */
  filterBySearch(data, searchQuery) {
    // console.log(searchQuery);
    if (searchQuery.length === 0) {
      return data;
    }
    const list = [];
    for (let i = 0; i < data.length; i++) {
      const position = data[i].position;
      const lowercase = position.toString().toLowerCase();
      if (lowercase.includes(searchQuery.toString().toLowerCase())) {
        list.push(data[i]);
      }
    }
    return list;
  }

  /**
   * Returns a sorted list by location
   * @param data Data we want to sort
   * @param The search query
   * @returns {Array} An array consisting of user selection
   */
  filterByLocation(data, input) {
    if (input === 'any') {
      return data;
    }
    return _.filter(data, ['location.state', input]);
  }
}

export default InternshipsFilters;
