

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
  search() {

  }

  /**
   * Sets an internal cursor to point to the next listing to be parsed.
   * @return false if there are no more listings to parse.
   * @throws Error if a problem occurred getting the next listing.
   */
  nextListing() {

  }

  /**
   * Parses the current listing.
   * Adds the parsed listing to an internal object.
   * @throws Error if a problem occurred parsing this listing.
   */
  parseListing() {}

  /**
   * Writes the listings to the outputFilePath.
   * @throws Error if a problem occurred writing the listings.
   */
  writeListings() {}

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
  writeStatistics() {}

}

export default Scraper;
