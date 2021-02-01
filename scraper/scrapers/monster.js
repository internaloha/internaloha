import Logger from 'loglevel';
import { fetchInfo, startBrowser, writeToJSON } from './scraperFunctions.js';

async function getData(page) {
  const results = [];
  for (let i = 0; i < 6; i++) {
    // get title, company, description, city, state, and zip
    results.push(fetchInfo(page, 'h1[itemprop="title"]', 'innerText'));
    results.push(fetchInfo(page, 'div[class="arDetailCompany"]', 'innerText'));
    results.push(fetchInfo(page, 'div[itemprop="description"]', 'innerHTML'));
    results.push(fetchInfo(page, 'span[itemprop="addressLocality"]', 'innerText'));
    results.push(fetchInfo(page, 'span[itemprop="addressRegion"]', 'innerText'));
    results.push(fetchInfo(page, 'span[itemprop="postalCode"]', 'innerText'));
  }
  return Promise.all(results);
}

async function setSearchFilter(page) {
  try {
    await page.waitForSelector('input[id="searchview"]');
    await page.type('input[id="searchview"]', 'internship');
    await page.keyboard.press('Enter');
    await page.waitForSelector('button[id="locations-filter-acc"]');
    await page.click('button[id="locations-filter-acc"]');
    await page.waitForSelector('input[id="locations-filter-input"]');
    await page.click('input[id="locations-filter-input"]');
    // Separated 'United' and 'States' so that dropdown list comes out
    await page.type('input[id="locations-filter-input"]', 'United');
    await page.type('input[id="locations-filter-input"]', ' States');
  } catch (err2) {
    Logger.debug(err2.message);
  }
}

async function main() {
  let browser;
  let page;
  const data = [];
  Logger.enableAll(); // this enables console logging. Will replace with CLI args later.
  try {
    Logger.info('Executing script...');
    [browser, page] = await startBrowser();
    await page.goto('https://www.monster.com/jobs/search/?q=computer-science-intern&intcid=skr_navigation_nhpso_searchMain&tm=30');
    await setSearchFilter(page);
    let nextPage = true;
    while (nextPage === true) {
      try {
        await page.waitForTimeout(2000);
        await page.waitForSelector('div[class="mux-search-results"]');
        await page.click('a[id="loadMoreJobs"]');
        Logger.info('Nagivating to next page....');
      } catch (e2) {
        Logger.debug('Finished loading all pages.');
        nextPage = false;
      }
    }

    await page.waitForNavigation;
    const totalPage = await page.evaluate(() => document.querySelectorAll('ul[class="pagination"] li').length);
    // for loop allows for multiple iterations of pages -- start at 2 because initial landing is page 1
    for (let i = 2; i <= totalPage; i++) {
      // Fetching all urls in page into a list
      const urls = await page.evaluate(() => {
        const urlFromWeb = document.querySelectorAll('h3 a');
        const urlList = [...urlFromWeb];
        return urlList.map(url => url.href);
      });
      // Iterate through all internship positions
      try {
        for (let j = 0; j < urls.length; j++) {
          await page.goto(urls[j]);
          const lastScraped = new Date();
          const [position, company, description, city, state, zip] = await getData(page);
          data.push({
            url: urls[j],
            position: position,
            company: company.trim(),
            location: { city: city, state: state, zip: zip },
            lastScraped: lastScraped,
            description: description,
          });
        }
      } catch (err1) {
        Logger.error(err1.message);
      }
      // await page.waitForSelector('div[id="JobPreview"]');
      // await page.waitForTimeout(500);
      // const location = await fetchInfo(page, 'div.heading h2.subtitle', 'innerText');
      // const description = await fetchInfo(page, 'div[id="JobDescription"]', 'innerHTML');
      // const url = await page.url();
      /** let daysToGoBack = 0;
       if (posted[i].includes('today')) {
          daysToGoBack = 0;
        } else {
          // getting just the number (eg. 1, 3, 20...)
          daysToGoBack = posted[i].match(/\d+/g);
        }
       // going backwards
       date.setDate(date.getDate() - daysToGoBack);
       let zip = location.match(/([^\D,])+/g);
       if (zip != null) {
          zip = zip[0];
        } else {
          zip = 'N/A';
        }
       data.push({
          position: position[i].trim(),
          company: company[i].trim(),
          location: {
            city: location.match(/^([^,]*)/g)[0],
            state: location.match(/([^,\d])+/g)[1].trim(),
            zip: zip,
          },
          url: url,
          posted: date,
          lastScraped: lastScraped,
          description: description.trim(),
        });
       await page.waitForSelector('div[id="JobPreview"]');
       totalJobs++;
       } catch (err) {
        Logger.debug('Error fetching link, skipping');
      }
       }* */
    }
    // write results to JSON file
    await writeToJSON(data, 'monster');
    await browser.close();
  } catch (e) {
    Logger.debug('Our Error:', e.message);
    Logger.debug('\nData successfully written!');
    await browser.close();
  }
}

main();
