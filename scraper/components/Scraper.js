export class Scraper {
  /** Initialize the scraper state and provide configuration info. */
  constructor(name, url, credentials, minimumListings, listingFilePath, statisticsFilePath) {
    this.name = name;
    this.url = url;
    this.credentials = credentials;
    this.minimumListings = minimumListings;
    this.listingFilePath = listingFilePath;
    this.statisticsFilePath = statisticsFilePath;
  }

  /**
   * Go to the site and perform any login necessary.
   * @throws Error if login fails or site cannot be found.
   * page: the website page
   * credentialsUser: the the login username
   * credentialsPassword: the the login Password
   * elementsUser: the css element for username
   * elementsPassword: the css element for password
   * elementsLogin: the css element for the login button
   */
  async login(page, credentialsUser, credentialsPassword, elementsUser, elementsPassword, elementsLogin) {
    await page.type(elementsUser, credentialsUser);
    await page.type(elementsPassword, credentialsPassword);
    await page.click(elementsLogin);
  }

  /**
   * Search for internship listings.
   * This can yield either a set of URLs to pages with listings, or a single page with all the listings.
   * @throws Error if the search generates an error, or if it does not yield minimumListings.
   */
  async search(page) {
    await page.waitForNavigation();
    await page.waitForSelector('a[class="styles_component__1c6JC styles_defaultLink__1mFc1 styles_information__1TxGq"]');
    await page.click('div[class="styles_roleWrapper__2xVmi"] > button');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('Engineering');
    await page.keyboard.press('Enter');
    await page.click('div[class="styles_locationWrapper__ScGs8"] > button');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('United States');
    await page.keyboard.press('Enter');
  }

  /**
   * Sets an internal cursor to point to the next listing to be parsed.
   * @return false if there are no more listings to parse.
   * @throws Error if a problem occurred getting the next listing.
   */
  async nextListing(page) {
    await page.click('button[class="styles_component__3A0_k styles_secondary__2g46E styles_small__6SIIc styles_toggle__3_6jN"]');
    await page.waitForSelector('button[class="styles_component__3A0_k styles_primary__3xZwV styles_small__6SIIc styles_emphasis__KRjK8"]');
    if (await page.$('div[class="styles_component__3ztKJ styles_active__3CAxI"] > div[class="styles_header__PMZlN"] > button') !== null) {
      // click clear
      await page.click('div[class="styles_component__3ztKJ styles_active__3CAxI"] > div[class="styles_header__PMZlN"] > button');
      await page.click('label[for="form-input--jobTypes--internship"]');
    } else {
      await page.click('label[for="form-input--jobTypes--internship"]');
    }
  }

  /**
   * Parses the current listing.
   * Adds the parsed listing to an internal object.
   * @throws Error if a problem occurred parsing this listing.
   */
  parseListing(page) {
    const results = [];
    for (let i = 0; i < 6; i++) {
      //get the title, company, description, city, state, and zip
      results.push(fetchInfo(page, 'div[class="styles_description__4fnTp"]', 'innerHTML'));
      results.push(fetchInfo(page, 'div[class="styles_component__1iUh1"] > div:nth-child(1) > dd > div > span', 'innerText'));
      results.push(fetchInfo(page, 'h2[class="styles_component__1kg4S styles_header__3m1pY __halo_fontSizeMap_size--2xl __halo_fontWeight_medium"]', 'innerText'));
      results.push(fetchInfo(page, 'a[class="styles_component__1c6JC styles_defaultLink__1mFc1 styles_anchor__2aXMZ"]', 'innerText'));
    }
  }

  /**
   * Writes the listings to the outputFilePath.
   * @throws Error if a problem occurred writing the listings.
   */
  async writeListings(page, urls) {
    const data = [];
    const totalPage = await page.evaluate(() => document.querySelectorAll('ul[class="pagination"] li').length);
    try {
      for (let i = 0; i <= urls.length; i++) {
        await page.goto(urls[i]);
        const lastScrapped = new Date();
        const [position, company, description, city, state, zip] = await getData(page);
        data.push({
          url: urls[i],
          position: position,
          company: company.trim(),
          location: { city: city, state: state, zip: zip },
          lastScrapped: lastScrapped,
          description: description,
        });
      }
    } catch (err1) {
      Logger.error(err1.message);
    }
    await writeToJSON(data, page.name);
  }

  /**
   * Appends a line to the statisticsFilePath with statistics about this run.
   * The statistics file is in CSV format.
   * Statistics include:
   *   * Name of scraper
   *   * Date and time of the run.
   *   * Elapsed time for this run.
   *   * Total number of listings found.
   *   * Any errors thrown (including short description)
   */
  async writeStatistics(data) {
    await fs.writeFileSync('./data/canonical/angellist.canonical.data.json', JSON.stringify(data, null, 4),
        (err2) => {
          if (err2) {
            Logger.warn(data, err2);
          }
        });
    Logger.error(`Elapsed time for angellist: ${moment(startTime).fromNow(true)} | ${data.length} listings scraped `);
  }

}

export default Scraper;
