import { Scraper } from './Scraper';

export class TestScraper extends Scraper {
  constructor() {
    super({ name: 'TestScraper', url: 'https://testscrapersite.com' });
  }
}
