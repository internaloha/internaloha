import puppeteer from 'puppeteer';
import fs from 'fs';
import { fetchInfo } from './scraper-functions.js';


(async () => {
  const browser = await puppeteer.launch({ devtools: true }); // Slow down by 250 ms
  const page = await browser.newPage();
  try {

    await page.goto('https://www.youtern.com/');
    // sign in process here
    // click sign in button
    await page.waitForSelector('a[class="inline-act forgot-act"]');
    await page.click('a[class="inline-act forgot-act"]');
    await page.waitForSelector('input[id=email]');
    await page.type('input[id=email]', 'ausui@hawaii.edu');
    await page.waitForSelector('input[id=password]');
    await page.type('input[id=password]', 'bball24');
    await page.click('input[name="submit.commonLogin"]');

    // Go to search internship page
    await page.waitForTimeout(2000);
    await page.goto('https://www.youtern.com/cm/candidate/search_jobs');

    await page.waitForSelector('div.flineQbox');
    await page.click('input[id=pngFix]');
    await page.waitForSelector('div.left');

    const jobArray = [];

    // wait for page to load
    await page.waitForSelector('div.content_bottom > div.left > div.s-res h3 a');
    // gather all the links
    const links = await page.evaluate(
        () => Array.from(
            // eslint-disable-next-line no-undef
            document.querySelectorAll('div.content_bottom > div.left > div.s-res h3 a'),
            a => `https://www.youtern.com${a.getAttribute('href')}`,
        ),
    );

    try {

      // go through each link and fetch info
      for (let i = 0; i < links.length; i++) {
        await page.goto(links[i]);
        const position = await fetchInfo(page, 'div.left h2', 'innerText');
        const posted = await fetchInfo(page, 'td[class="f vac_item_post_date"] + td', 'innerText');
        const company = await fetchInfo(page, 'td[class="f vac_item_employer"] + td', 'innerText');
        const city = await fetchInfo(page, 'td[class="f vac_item_city"] + td', 'innerText');
        const state = await fetchInfo(page, 'td[class="f vac_item_state"] + td', 'innerText');
        const zip = await fetchInfo(page, 'td[class="f vac_item_post_code"] + td', 'innerText');
        const qualifications = await fetchInfo(page, 'td[class="f vac_item_completed_education"] + td', 'innerText');
        const compensation = await fetchInfo(page, 'td[class="f vac_item_paid"] + td', 'innerText');
        const description = await fetchInfo(page, 'td[class="f vac_item_job_description"] + td', 'innerHTML');
        const due = await fetchInfo(page, 'td[class="f vac_item_expiration_date"] + td', 'innerText');
        const lastScraped = new Date();

        jobArray.push({
          position: position.trim(),
          company: company.trim(),
          location: {
            city: city.trim(),
            state: state.trim(),
            zip: zip.trim(),
          },
          posted: posted.trim(),
          due: due.trim(),
          compensation: compensation.trim(),
          qualifications: qualifications.trim(),
          url: links[i].trim(),
          lastScraped: lastScraped,
          description: description.trim(),
        });

        console.log(position);
      }

    } catch (er2) {
      console.log('Error scraping links:', er2.message);
    }

    console.log(jobArray);
    // write json file
    fs.writeFile('./data/canonical/youtern.canonical.data.json', JSON.stringify(jobArray, null, 4), 'utf-8', function (err) {
      if (err) throw err;
      console.log('Your info has been written into JSON file');
    });

    await browser.close();
    console.log('Process Completed');
  } catch (err) {
    console.log('Something went wrong', err.message);
    await browser.close();
  }
})();
