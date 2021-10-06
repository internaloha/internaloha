import { Scraper } from './Scraper';

export class TestScraper2 extends Scraper {
  constructor() {
    super({ name: 'TestScraper2', url: 'https://testscrapersite.com' });
  }
}
