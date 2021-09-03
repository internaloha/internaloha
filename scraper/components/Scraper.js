export class Scraper {
  /** Initialize the scraper state and provide configuration info. */
  constructor(name, url, credentials, minimumListings, listingFilePath, statisticsFilePath) {}

  /**
   * Go to the site and perform any login necessary.
   * @throws Error if login fails or site cannot be found.
   * page: the website page
   * name: the name of the website e.g. angelist...
   */
  login(page, name) {
    // Navigate to login page
    /* await page.type('input[id="user_email"]', credentials.name.user); we need the name of the page
    await page.type('input[id="user_password"]', credentials.name.password);
    await page.click('input[class="c-button c-button--blue s-vgPadLeft1_5 s-vgPadRight1_5"]'); I think this has to deal with the cs of the page I dont know if we would be able to make this a general function, maybe have it take css as a property?
    */
  }

  /**
   * Search for internship listings.
   * This can yield either a set of URLs to pages with listings, or a single page with all the listings.
   * @throws Error if the search generates an error, or if it does not yield minimumListings.
   */
  search() {}

  /**
   * Sets an internal cursor to point to the next listing to be parsed.
   * @return false if there are no more listings to parse.
   * @throws Error if a problem occurred getting the next listing.
   */
  nextListing() {}

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
