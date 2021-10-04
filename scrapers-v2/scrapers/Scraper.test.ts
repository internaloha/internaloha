import { Scraper } from './Scraper';

export class TestScraper extends Scraper {
  constructor({ logLevel }) {
    super({ name: 'TestScraper', url: 'https://testscrapersite.com', minimumListings: 10, logLevel });
  }

}
