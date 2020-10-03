const puppeteer = require('puppeteer');
const fs = require('fs');

function removeDuplicates(skills) {
  return [...new Set(skills)];
}

async function getLinks(page) {
  try {
    const links = page.evaluate(
        () => Array.from(
            // eslint-disable-next-line no-undef
            document.querySelectorAll('div[class=top-meta] a'),
            a => a.getAttribute('href'),
        ),
    );
    return links;
  } catch (errl) {
    console.log('error with get links', errl.message);
  }
}

async function getAllLinks(page) {

  try {
    let next = true;
    const allLinks = [];
    while (next === true) {
      try {
        await page.waitFor(1000);
        getLinks(page).then((links => {
          allLinks.push(links);
        }));
        await page.waitFor(3000);
        const nextPage = await page.$('ul[class=paging] a[rel=next]');
        if (nextPage !== null) {
          await nextPage.click();
        } else {
          next = false;
        }

      } catch (errp) {
        console.log(errp.message);
        console.log(allLinks);
        next = false;
        console.log('\nReached the end of pages!');
      }
    }
    return allLinks;
  } catch (erra) {
    console.log('error with getting allLinks', erra.message);
  }
}

async function getPageInfo(page, allLinks) {
  try {
    let JobsScraped = 0;
    const details = [];
    for (let i = 0; i < allLinks.length; i++) {
      for (let j = 0; j < allLinks[i].length; j++) {
        console.log(allLinks);
        const url = `https://www.coolworks.com${allLinks[i][j]}`;

        console.log(url);
        await page.waitForSelector('div[class=top-meta]');

        const company = await page.$$('div[class=top-meta] h5');
        const location = await page.$$('p[class=locations] a');
        const posted = await page.$$('div[class=link-job] span');


        let skills = '';
        skills = await page.$$('p[class=blurb]');
        if (skills.length === 0) {
          skills = 'N/A';
        } else {
          skills = removeDuplicates(skills);
        }

        await page.goto(url);

        await page.waitForSelector('div[class=ttl-decor fixed-ttl]');
        const position = fetchInfo(page, 'div[class=ttl-decor fixed-ttl] h1');

        const contact = fetchInfo(page, 'ul[class=contact-list] li');
        const compensation = fetchInfo(page, 'div[class=benefits]');
        const qualifications = fetchInfo(page, 'div[class=employee_expectations] p');
        const description = fetchInfo(page, 'div[class=employee-experience] p');
        const lastScraped = new Date();

        JobsScraped++;

        details.push({
          position: position,
          company: company,
          location: location,
          posted: posted,
          contact: contact,
          compensation: compensation,
          qualifications: qualifications,
          skills: skills,
          description: description,
          url: url,
          lastScraped: lastScraped,
        });
      }
    }
    console.log('Total Jobs Scraped: ', JobsScraped);
    return details;
  } catch (errp) {
    console.log('error with getting page info:', errp.message);
  }
}

async function fetchInfo(page, selector) {
  let result;
  try {

    await page.waitForSelector(selector);
    result = await page.evaluate(document.querySelector(selector));
  } catch (error) {
    console.log('Error with fetching info', error.message);
    result = 'Error';
  }
  return result;
}

(async () => {
  try {
    const browser = await puppeteer.launch({ slowMo: 250, devtools: true }); // Slow down by 250 ms
    const page = await browser.newPage();
    await page.goto('https://www.coolworks.com/search?q=');
    // search technology jobs
    await page.waitForSelector('input[id=search_keywords]');
    // change value for what you want to search
    await page.evaluate(() => {
      document.querySelector('input[id=search_keywords]').value = 'computer';
    });
    await page.evaluate(() => {
      document.querySelector('div[class=search-submit]').click();
    });
    await page.waitForSelector('article[class=employer-post');

    // Scrape information
    try {
      getAllLinks(page).then((allLinks => {
        getPageInfo(page, allLinks).then((details => {
          fs.writeFile('scrapers/coolworksP.canonical.data.json', JSON.stringify(details), function (e) {
            if (e) throw e;
            console.log('Your info has been written into the coolworksP.canonical.data.JSON file');
          });
          console.log('Process Completed');
        }));
      }));
    } catch (errorDetailType) {
      console.log('Error with scraping', errorDetailType.message);
    }
  } catch (e) {
    console.log('Something went wrong', e.message);
  }
})();
