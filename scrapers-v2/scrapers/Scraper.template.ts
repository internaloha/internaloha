import { Scraper } from './Scraper';

const prefix = require('loglevel-plugin-prefix');

export class TemplateScraper extends Scraper {
  constructor() {
    super({ name: 'template', url: 'https://testscrapersite.com' });
  }

  async launch() {
    await super.launch();
    prefix.apply(this.log, { nameFormatter: () => this.name.toUpperCase() });
  }
}
