import { Scraper } from './Scraper';

export class NsfReuScraper extends Scraper {
  constructor() {
    super({ name: 'nsf-reu', url: 'https://www.nsf.gov/crssprgm/reu/list_result.jsp?unitid=5049' });
  }

  async login() {
    await this.page.goto(this.url);
  }

}
