import { Scraper } from './Scraper';

export class NsfReuScraper extends Scraper {
  private listingUrls: string[];
  constructor() {
    super({ name: 'nsf-reu', url: 'https://www.nsf.gov/crssprgm/reu/list_result.jsp?unitid=5049' });
    this.listingUrls = [];
    console.log(this.listingUrls);
  }

  async login() {
    super.login();
    await this.page.goto(this.url);
  }

  async findListings() {
    super.findListings();
    await this.page.goto('https://www.nsf.gov/crssprgm/reu/list_result.jsp?unitid=5049');
    await this.page.waitForSelector('button[id="itemsperpage_top"]');
    await this.page.click('button[id="itemsperpage_top"]');
    await this.page.waitForSelector('a[onclick="showItemsPerPageForm(event, \'All\', \'?unitid=5049\')"]');
    await this.page.click('a[onclick="showItemsPerPageForm(event, \'All\', \'?unitid=5049\')"]');
    await this.page.waitForSelector('td[data-label="Site Information: "] > div > a');
    await this.page.waitForSelector('td[data-label="Site Information: "] > div > a');
    const urls = await this.page.evaluate(() => {
      const localUrls = [];
      const urlFromWeb: NodeListOf<Element> = document.querySelectorAll('td[data-label="Site Information: "] > div > a');
      urlFromWeb.forEach(url => localUrls.push(url['href']));
      return localUrls;
    });
    console.log(urls);
  }
}
