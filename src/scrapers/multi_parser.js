/* eslint-disable max-len,no-param-reassign */
const natural = require('natural');
const fs = require('fs');
const path = require('path');

/** Removes duplicate in skills
 * @param  {Array} skills    The word we're looking for
 * @return {Array}     Returns an array with no duplicates
 */
function removeDuplicates(skills) {
  return [...new Set(skills)];
}

/** Fetches the sentences that include the word we are looking for AND has a number.
 * @param  {String} word    The word we're looking for
 * @param  {JSON} textInput  The JSON file. We use it to update the JSON file (eg.textInput.compensation)
 * @param {Boolean} date       T/F to check if user wants the sentence to include a number
 * @return {String}          The string that has both the word we are looking for and a number. If it doesn't find any,
 it returns null.
 */
function getSentencesWithWord(word, textInput, date) {

  // replace all \n with spaces
  const noNewLine = textInput.replace(/([\n])\s*/ig, ' ');

  // Search for sentences, insert a pipe, then split on the pipe
  const sent = noNewLine.replace(/([.?!-])\s*(?=[A-Z])/ig, '$1|').split('|');

  const sentence = sent.filter(sentences => sentences.includes(word));

  // Checks to see if sentence array has something
  if (sentence.length !== 0) {
    // Checks to see if sentence has a number
    if (date === true) {
      if (sentence[0].match(/[\d] /g)) {
        // console.log(sentence);
        return sentence;
      }
    }
    // console.log(sentence);
    return sentence;
  }
  return null;
}

/** Converts due dates into Date
 * @param  {String} input    The string we want to convert
 * @param  {JSON} textInput  The JSON file. We use it to update the JSON file (eg.textInput.compensation)
 * @return N/A               Doesn't return anything
 */
function getDueDates(input, textInput) {

  if (input !== null) {
    // matches dates like 07/26/2020
    const dateType = /\d{0,2}(\D)\d{2}\1\d{4}/g;

    // matches dates like July 12, 2020
    const dateTypeWord = /\b((?:(?:Jan(?:uary)?)|(?:Feb(?:ruary)?)|(?:March?)|(?:April?)|(?:May)|(?:June?)|(?:July?)|(?:Aug(?:ust)?)|(?:Sept(?:ember)?)|(?:Oct(?:ober)?)|(?:Nov(?:ember)?)|(?:Dec(?:ember)?))(|,)\s+\d{0,2}\s*,?\s*\d{0,4})+/ig;

    if (input[0].match(dateType)) {
      // matches then removes any with comma
      let date = input[0].match(dateType);
      date = date[0].replace(/(,)+/g, '');

      // if the date is M/DD/YYYY, change to MM/DD/YYYY by adding padding 0
      if (!date.match(/^(\d{2})/g)) {
        date = `0${date}`;
      }

      const dueDate = new Date(date);
      if (dueDate instanceof Date && !isNaN(dueDate.valueOf())) {
        textInput.due = dueDate;
        // console.log(dueDate);
      }

    }

    // Checks to see if it matches dates like July 12, 2020
    if (input[0].match(dateTypeWord)) {
      // console.log(input[0].match(dateTypeWord));
      let words = input[0].match(dateTypeWord);
      // remove all commas
      words = words[0].toString().replace(/(,)+/g, '');

      // Does the date have numbers in them?
      if (words.match(/(\d)/g)) {
        let date = words;
        // Does the date include a year? (If not, it messes up new Date generation so we add it)
        if (!words.match(/\d{4}/g)) {
          const today = new Date();
          const year = today.getFullYear();
          date = `${words} ${year}`;
        }
        const dueDate = new Date(date);
        // Only update Due date if the Date generated is valid
        if (dueDate instanceof Date && !isNaN(dueDate.valueOf())) {
          textInput.due = dueDate;
          // console.log(dueDate);
        }
      }

    }
  }
}

/** Converts start dates into Date
 * @param  {String} input    The string we want to convert
 * @param  {JSON} textInput  The JSON file. We use it to update the JSON file (eg.textInput.compensation)
 * @return N/A               Doesn't return anything
 */
function getStartDates(input, textInput) {
  if (input !== null) {
    // matches dates like 07/26/2020
    const dateType = /\d{0,2}(\D)\d{2}\1\d{4}/g;

    // matches dates like July 12, 2020
    const dateTypeWord = /\b((?:(?:Jan(?:uary)?)|(?:Feb(?:ruary)?)|(?:March?)|(?:April?)|(?:May)|(?:June?)|(?:July?)|(?:Aug(?:ust)?)|(?:Sept(?:ember)?)|(?:Oct(?:ober)?)|(?:Nov(?:ember)?)|(?:Dec(?:ember)?))(|,)\s+\d{0,2}\s*,?\s*\d{0,4})+/ig;

    if (input[0].match(dateType)) {
      // matches then removes any with comma
      let date = input[0].match(dateType);
      date = date[0].replace(/(,)+/g, '');

      // if the date is M/DD/YYYY, change to MM/DD/YYYY by adding padding 0
      if (!date.match(/^(\d{2})/g)) {
        date = `0${date}`;
      }

      // console.log(date);
      const dueDate = new Date(date);
      if (dueDate instanceof Date && !isNaN(dueDate.valueOf())) {
        textInput.start = dueDate;
        // console.log(dueDate);
      }

    }

    // Checks to see if it matches dates like July 12, 2020
    if (input[0].match(dateTypeWord)) {
      let words = input[0].match(dateTypeWord);

      // remove all commas
      words = words[0].replace(/(,)+/g, '');

      let date = words;
      // Does the date include a year? (If not, it messes up new Date generation so we add it)
      if (!words.match(/\d{4}/g)) {
        const today = new Date();
        const year = today.getFullYear();
        date = `${words} ${year}`;
      }
      // console.log(date);
      const dueDate = new Date(date);
      // Only update Due date if the Date generated is valid
      if (dueDate instanceof Date && !isNaN(dueDate.valueOf())) {
        textInput.start = dueDate;
        // console.log(dueDate);
      }

    }
  }
}

/** Uses NLP to get skills
 * @param  {Classifier} classifier    The classifier
 * @return N/A               Doesn't return anything
 */
function trainSkills(classifier) {
  // Keep stops so we are able to get words like "C/C++/C#"
  classifier.setOptions({
    keepStops: true,
  });

  const IT = ['it management',
    'it systems',
    'it support',
    'it solutions',
    'information technology',
    'Information Technology',
    'technical support',
    'customer service',
    'it environment',
    'it development'];

  const webDev = ['html', 'html5', 'css', 'css5', 'web design', 'web standards', 'website development', 'website development/'];
  const react = ['react', 'reactJS', 'react native'];
  const javascript = ['javascript'];
  const python = ['python'];
  const mobile = ['android', 'iphone', 'mobile'];
  const softwareEngineering = ['software engineer', 'software engineering', 'Software Engineering'];
  const dataScience = ['data science', 'big data', 'data analyst', 'Data Science'];
  const AI = ['ai', 'artificial intelligence', 'ai based solution', '(ai)'];
  const cloud = ['cloud computing', 'azure', 'google cloud', 'cloud technologies', 'amazon web services', 'iass', 'paas', 'saas', 'cloud'];
  const deepLearning = ['pytorch', 'tensorflow', 'mxnet', 'darknet', 'caffe'];
  const bioinformatics = ['bioinformatics', 'biology', 'biological', 'biostatistic'];
  const robotics = ['robotics', 'robot'];

  const cyberSecurity = [
    'cybersecurity',
    'cyber security',
    'security',
    'cryptography',
    'cryptographic algorithm',
    'network security',
    'protocol',
    'penetration testing',
    'vulnerability analysis',
    'blockchain',
    'Cybersecurity',
  ];

  const SQL = [
    'microsoft sql',
    'database',
    'mysql',
    'monetDB',
    'oracle',
    'postgresql',
    'postgre',
    'ssp',
    'mongodb',
    'sqlite',
    'sql queries',
    'database management',
    'sql',
    'sql server',
    'interfacing with database',
    'db',
  ];

  classifier.addDocument(mobile, 'mobile development');
  classifier.addDocument(dataScience, 'data science');
  classifier.addDocument(webDev, 'web development');
  classifier.addDocument(react, 'react');
  classifier.addDocument(javascript, 'javascript');
  classifier.addDocument(python, 'python');
  classifier.addDocument(softwareEngineering, 'software engineering');
  classifier.addDocument('software engineering', 'software engineering');
  classifier.addDocument(cyberSecurity, 'cybersecurity');
  classifier.addDocument(IT, 'information technology');
  classifier.addDocument('information technology', 'information technology');
  classifier.addDocument(cloud, 'cloud computing');
  classifier.addDocument(SQL, 'SQL');
  classifier.addDocument(deepLearning, 'deep learning');
  classifier.addDocument(AI, 'artificial intelligence');
  classifier.addDocument(bioinformatics, 'bioinformatics');
  classifier.addDocument('bioinformatics', 'bioinformatics');
  classifier.addDocument(robotics, 'robotics');

  classifier.addDocument('angular', 'angular');
  classifier.addDocument('java', 'java');
  classifier.addDocument('visualization', 'data visualization');
  classifier.addDocument('MATLAB', 'matlab');

  classifier.addDocument(['c++', 'c'], 'C and C++');
  classifier.addDocument('machine learning', 'machine learning');
  classifier.addDocument('DevOps', 'DevOps');
  classifier.train();

}

/** Uses NLP to get skills
 * @param  {Classifier} classifier    The classifier
 * @return N/A               Doesn't return anything
 */
function trainCompensation(classifier) {
  classifier.addDocument('salary', 'paid');
  classifier.addDocument('paid', 'paid');
  classifier.addDocument('unpaid', 'unpaid');
  classifier.train();
}

/** Checks via regex for any matches with $ except for any that follow the pattern $0.00, $00.00
 * @param  {String} input    The string we want to convert
 * @param  {JSON} textInput  The JSON file. We use it to update the JSON file (eg.textInput.compensation)
 * @return N/A               Doesn't return anything
 */
function getCompensation(input, textInput) {
  if (input !== null) {
    if (input[0].match(/([$][^0]\d{0,4}.\d{0,5})+/ig)) {
      if (!textInput.compensation || textInput.length === 0) {
        textInput.compensation = 'paid';
      }
    } else
        // if it has $0.00, it is marked as unpaid
      if (input[0].match(/([$][0])+/ig)) {
        if (!textInput.compensation || textInput.length === 0) {
          textInput.compensation = 'unpaid';
        }
      }
  }
}

/** Gets qualification using string.includes() method
 * @param  {JSON} textInput  The JSON file. We use it to update the JSON file (eg.textInput.compensation)
 * @return N/A               Doesn't return anything
 */
function getQualifications(textInput) {
  const qualifications = [];
  const textLower = textInput.description.toString().toLowerCase();

  if (textLower.includes('bachelor')) {
    qualifications.push('Bachelor\'s degree');
  }

  if (textLower.includes('eligible to work in the')) {
    qualifications.push('Eligible to work in the U.S');
  }

  if (textLower.includes('us citizen')) {
    qualifications.push('U.S Citizen');
  }

  if (qualifications.length !== 0) {
    textInput.qualifications = qualifications;
  }
}

/** Gets contact information (email & phone number)
 * @param  {JSON} textInput  The JSON file. We use it to update the JSON file (eg.textInput.compensation)
 * @return N/A               Doesn't return anything
 */
function getContact(textInput) {

  // Regex for phone numbers: ([(\d{0,3})]+-\d{0,4}-\d{0,4})|(\d{10})+
  const description = textInput.description.toString();

  const phone = description.match(/((\d{1}-)+[(\d{3})]+-\d{3}-\d{4})+|([(\d{3})]+-\d{3}-\d{4})+/ig);
  const email = description.match(/(\w+@\w+\.com+)/ig);

  if (email !== null && phone !== null) {
    // console.log(`${email[0]}, ${phone[0]}`);
    textInput.contact = `${email[0]}, ${phone[0]}`;
  } else
    if (email !== null) {
      // console.log(email[0]);
      textInput.contact = email[0];
    } else
      if (phone !== null) {
        textInput.contact = phone[0];
        // console.log(phone[0]);
      }

}

/** Gets qualification using string.includes() method
 * @param  {String} file  Relative path for the file we want to parse
 * @return N/A       Doesn't return anything
 */
function multi_parser(file) {

  console.log('Parsing: ', file);

  const text = JSON.parse(fs.readFileSync(file, 'utf8'));

  const classifier = new natural.LogisticRegressionClassifier();
  const classifierComp = new natural.LogisticRegressionClassifier();

  trainSkills(classifier);
  trainCompensation(classifierComp);

// sees the training process
// classifier.events.on('trainedWithDocument', function (obj) {
//   console.log(obj);
// });

  let count = 0;
  let compCount = 0;
  let results = '';
  let positionResults = '';
  let compensation = '';

  for (let i = 0; i < text.length; i++) {

    const position = text[i].position;

    try {
      // replace all the new lines with a space
      const description = text[i].description.replace(/(\r\n|\n|\r)/gm, ' ');

      // replace comma as they an affect the matching process (Eg. "cybersecurity" vs. "cybersecurity,")
      const descriptionClean = description.replace(/,/g, '');

      // IT is not matching replacing all of them with "Information Technology for better matching
      const descriptionIT = descriptionClean.replace(/IT/gm, 'Information Technology');

      results = classifier.getClassifications(descriptionIT);
      positionResults = classifier.getClassifications(position);
      compensation = classifierComp.getClassifications(text[i].description);

    } catch (e) {
      console.log('No description:', e.message);
    }

    const data = [];
    const remote = [];
    const comp = [];

    // adding compensation
    for (let j = 0; j < compensation.length; j++) {
      if (compensation[j].value > 0.5) {
        comp.push(compensation[j].label);
      }
    }

    // count the amount of internships where there we no apparent matches
    if (comp.length === 0) {
      compCount++;
    }

    // adding the skills
    for (let j = 0; j < results.length; j++) {

      // when it's exactly 0.5, it means no matches found so we need to check on it
      if (results[j].value > 0.5) {
        data.push(results[j].label);
      }

      if (positionResults[j].value > 0.5) {
        data.push(positionResults[j].label);
      }

      // for possible location filter? (eg. remote / in-state, out of state, etc...)
      if (position.includes('Remote') || (position.includes('remote'))) {
        remote.push('Remote');
      }

    }

    // console.log(position);
    // console.log(positionResults);

    // count the amount of internships where there we no apparent matches
    if (data.length === 0) {
      count++;
    }

    // if skills key doesn't already exist or the value is N/A
    if (!text[i].skills || text[i].skills === 'N/A' || text[i].skills.length === 0) {
      text[i].skills = removeDuplicates(data);
    }

    // if no company
    if (!text[i].company || text[i].company === '') {
      text[i].company = 'N/A';
    }

    // if no description (eg. NSF-REU)
    if (!text[i].description || text[i].description === '') {
      text[i].description = `Contact: ${text[i].contact}`;
    }
    const descriptionLowercase = text[i].description.toString().toLowerCase();

    // if compensation key doesn't exist
    if (!text[i].compensation || text[i].compensation === '') {
      if (comp.length === 1) {
        text[i].compensation = comp[0];
      } else {
        const pay = getSentencesWithWord('pay', descriptionLowercase, true);
        const salary = getSentencesWithWord('salary', descriptionLowercase, true);
        getCompensation(pay, text[i]);
        getCompensation(salary, text[i]);
      }
    }

    // if it doesn't have start key
    if (!text[i].start || text[i].start === '') {
      const start = getSentencesWithWord('start', descriptionLowercase, false);
      getStartDates(start, text[i]);
    }

    // if text has no due date
    if (!text[i].due || text[i].due === '') {

      const deadline = getSentencesWithWord('deadline', descriptionLowercase, true);
      const due = getSentencesWithWord('due', descriptionLowercase, true);
      const application = getSentencesWithWord('application', descriptionLowercase, true);
      getDueDates(deadline, text[i]);
      getDueDates(due, text[i]);
      getDueDates(application, text[i]);
    }

    // if text has no contact information
    if (!text[i].contact || text[i].contact === '') {
      getContact(text[i]);
    }

    // if text has no qualification key
    if (!text[i].qualifications || text[i].qualifications === '') {
      getQualifications(text[i]);
    }

    // if text has no location.state or it is empty
    if (!text[i].location.state || text[i].location.state === '') {
      text[i].location.state = 'Unknown';
    }
  }

  console.log('Total entries:', text.length);
  console.log('Total descriptions with empty skills field:', count);
  console.log('Total entries with empty compensation field:', compCount);
  console.log('');

  let fileName = file.match(/([[a-zA-Z-])+/g);
  fileName = fileName[3];
  fs.writeFileSync(`./src/data/${fileName}.parsed.data.json`, JSON.stringify(text, null, 4), 'utf-8');

  // fs.writeFile(`data/parsed/${fileName}.parsed.data.json`,
  //     JSON.stringify(text, null, 4), 'utf-8',
  //     err => (err ? console.log('\nData not written!', err) :
  //         console.log('\nData successfully written!')));

}

/**
 * Find all files recursively in specific folder with specific extension, e.g:
 * findFilesInDir('./project/src', '.html') ==> ['./project/src/a.html','./project/src/build/index.html']
 * @param  {String} startPath    Path relative to this file or other file which requires this files
 * @param  {String} filter       Extension name, e.g: '.html'
 * @return {Array}               Result files with path string in an array
 */
function fromDir(startPath, filter) {

  let results = [];

  if (!fs.existsSync(startPath)) {
    console.log('no dir ', startPath);
    return;
  }

  const files = fs.readdirSync(startPath);
  for (let i = 0; i < files.length; i++) {
    const filename = path.join(startPath, files[i]);
    const stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      results = results.concat(fromDir(filename, filter)); // recurse
    } else
      if (filename.indexOf(filter) >= 0) {
        // console.log('-- found: ', filename);
        results.push(filename);
      }
  }
  return results;
}

const files = fromDir('./scrapers/data/canonical', '.json');

for (let i = 0; i < files.length; i++) {
  multi_parser(files[i]);
}
