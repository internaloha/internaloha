const puppeteer = require('puppeteer');
const fs = require('fs');

// get all links from one page
async function getLinks(page) {
  const pageLinks = await page.evaluate(
      () => Array.from(
          // eslint-disable-next-line no-undef
          document.querySelectorAll('p.title a'),
          a => `https://www.ihiretechnology.com${a.getAttribute('href')}`,
      ),
  );

  return pageLinks;
}

// fetch info on page with selector
async function fetchInfo(page, selector) {
  let result = '';
  try {
    result = await page.evaluate((select) => document.querySelector(select).textContent, selector);
  } catch (error) {
    console.log('Our Error: fetchInfo() failed.\n', error.message);
    result = 'Error';
  }
  return result;
}

// main function
(async () => {
  const browser = await puppeteer.launch({ devtools: true }); // Slow down by 250 ms
  const page = await browser.newPage();
  try {
    // sign in process
    await page.goto('https://www.ihiretechnology.com/jobseeker/account/password');
    await page.type('input[id=EmailAddress]', 'ausui@hawaii.edu');
    await page.click('button.btn.btn-link');
    await page.waitForSelector('input[id=Password]');
    await page.type('input[id=Password]', 'Bball2424~');
    await page.click('button.btn.btn-success.btn-lg');

    // // pop up button
    // await page.waitForSelector('button.btn.btn-primary.close-opted-out-notification');
    // await page.click('button.btn.btn-primary.close-opted-out-notification');
    // await page.waitFor(2000);

    // click search page
    await page.waitForSelector('li.text-center.nav-list-item-1 a');
    await page.click('ul.nav.navbar-nav li:nth-child(4)');
    await page.waitFor(2000);
    // // pop up button
    // if (page.waitForSelector('button[id=end-button]') === true) {
    //   await page.waitForSelector('button[id=end-button]');
    //   await page.click('button[id=end-button]');
    // }

    // type technology
    await page.waitForSelector('input[class=form-control]');
    await page.type('input[class=form-control]', 'technology');
    await page.waitFor(3000);

    // focus on location field- type nothing
    await page.focus('#location');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type('#location', ' ');

    // click find jobs button
    await page.click('button.btn.btn-primary.loading-indicator.radius-fix');
    await page.waitFor(3000);

    await page.waitForSelector('button[id="end-button"]');
    await page.click('button[id="end-button"]');

    // click checkboxes filters
    // past 30 days
    await page.waitForSelector('ul#AddedDate-aggregation-group.nav.nav-list > li:nth-child(5) > div.checkbox > label > input');
    await page.click('ul#AddedDate-aggregation-group.nav.nav-list > li:nth-child(5) > div.checkbox > label > input');
    await page.waitFor(2000);
    console.log('Set for last 30 days...');

    // entry level
    await page.click('div#search-aggregation-filter-section.well.well-sm.aggregation-container > div:nth-child(5) > label.aggregation-group > i');
    await page.waitFor(2000);
    await page.click('ul#ExperienceLevel-aggregation-group.nav.nav-list > li:nth-child(5) > div.checkbox > label > input');
    await page.waitFor(2000);
    console.log('Setting entry level filter..');

    // internship
    await page.click('div#search-aggregation-filter-section.well.well-sm.aggregation-container > div:nth-child(8) > label.aggregation-group > i');
    await page.waitFor(2000);
    await page.click('ul#EmploymentType-aggregation-group.nav.nav-list > li:nth-child(6) > div.checkbox > label > input');
    console.log('Setting as internship tag...');

    // variables
    const jobArray = [];
    const next = true;
    const links = [];
    let jobNumber = 0;
    try {
      // pagination, gathering links from each page
      const lastPageNum = 10;
      for (let index = 0; index < lastPageNum; index++) {
        await page.waitFor(1000);
        getLinks(page).then((pageLinks => {
          console.log(pageLinks);
          links.push(pageLinks);
        }));
        await page.waitFor(3000);

        if (index !== lastPageNum - 1) {
          await page.click('ul.list-inline.horizontal > li:nth-child(3) > a:nth-child(1)');
        } else {
          console.log('end of pages');
          index = lastPageNum;
        }
      }
    } catch (e) {
      console.log('Error with getting links: ', e.message);
    }

    try {
      // go through each link and fetch info
      for (let i = 0; i < links.length; i++) {
        for (let j = 0; j < links[i].length; j++) {
          await page.goto(links[i][j]);
          jobNumber++;
          await page.waitForSelector('div.jobdescription');

          // scrape info off each website
          // use natural parser to scrape qulifications and other info
          const position = await fetchInfo(page, 'h3[class=text-blue]');
          const location = await fetchInfo(page, 'div[class=col-xs-8] li:nth-child(2)');
          let state = '';
          if (!location.match(/([^,]*)/g)[2]) {
            state = 'United States';
          } else {
            state = location.match(/([^,]*)/g)[2].trim();
          }
          const description = await fetchInfo(page, 'div.jobdescription');
          const company = await fetchInfo(page, 'div[class=col-xs-8] li:nth-child(1)');
          // const qualifications = await fetchInfo(page, 'div.jobdescription p:nth-child(4)');
          // const compensation = await fetchInfo(page, 'div.jobdescription p:nth-child(3)');
          // // if start includes a month and year then copy it into let variable then return that
          // let start = await fetchInfo(page, 'div.jobdescription p:nth-child(4)');
          // if (start.includes(month)) {
          //   let d = start.match(month);
          //   let startMonth = month[d.getMonth()];
          // }
          const lastScraped = new Date();

          const posted = await fetchInfo(page, 'div[class=col-xs-8] li:nth-child(3)');
          const date = new Date();
          let daysBack = 0;
          if (posted.includes('day') || posted.includes('days')) {
            const matched = posted.match(/(\d+)/);
            if (matched) {
              daysBack = matched[0];
            }
            // } else if (posted.includes('month') || (posted.includes('months'))) {
            //     // 'a month ago...'
            //     if (posted.includes('a')) {
            //       daysBack = 30;
            //     } else {
            //       daysBack = posted.match(/\d+/g) * 30;
            //     }
            //   } else {
            //     daysBack = posted.match(/\d+/g);
          }
          date.setDate(date.getDate() - daysBack);
          const time = date;

          jobArray.push({
            position: position.trim(),
            location: {
              city: location.match(/([^,]*)/g)[0],
              state: state,
            },
            company: company.trim(),
            posted: time,
            // start: start.trim(),
            // compensation: compensation.trim(),
            // qualifications: qualifications.trim(),
            url: links[i][j],
            lastScraped: lastScraped,
            description: description.trim(),
          });
          console.log(position);
        }
      }

    } catch (er2) {
      console.log('Error scraping links:', er2.message);
    }

    console.log(jobArray);
    console.log(jobNumber);
    // write json file
    fs.writeFile('scrapers/data/canonical/iHireTech.canonical.data.json', JSON.stringify(jobArray, null, 4), 'utf-8', function (err) {
      if (err) throw err;
      console.log('Your info has been written into JSON file');
    });

    await browser.close();
    console.log('Process Completed');
  } catch (err) {
    console.log('Something went wrong', err.message);
    //await browser.close();
  }
})();
