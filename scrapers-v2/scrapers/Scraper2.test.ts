import { Scraper } from './Scraper';

export class TestScraper2 extends Scraper {
  constructor({ logLevel }) {
    super({ name: 'TestScraper2', url: 'https://testscrapersite.com', minimumListings: 10, logLevel });
  }
}
