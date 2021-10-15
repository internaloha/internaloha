import { Scraper } from './Scraper';

const prefix = require('loglevel-plugin-prefix');

function exposePage(distance, delay) {
  const timer = setInterval(() => {
    document.scrollingElement.scrollBy(0, distance);
    if (document.scrollingElement.scrollTop + window.innerHeight >= document.scrollingElement.scrollHeight) {
      clearInterval(timer);
    }
  }, delay);
}

async function exposePage2() {
  const delay = 3000;
  const className = 'styles_component__Qh1Jr';
  const wait = (ms) => new Promise(res => setTimeout(res, ms));
  const count = async () => document.querySelectorAll(className).length;
  console.log(count);
  const scrollDown = async () => {
    document.querySelector(`${className}:last-child`)
      .scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
  };

  let preCount = 0;
  let postCount = 0;
  do {
    preCount = await count();
    await scrollDown();
    await wait(delay);
    postCount = await count();
  } while (postCount > preCount);
  await wait(delay);
}

export class AngelListScraper extends Scraper {
  constructor() {
    super({ name: 'angellist', url: 'https://testscrapersite.com' });
  }

  async launch() {
    await super.launch();
    prefix.apply(this.log, { nameFormatter: () => this.name.toUpperCase() });
    this.log.warn(`Launching ${this.name.toUpperCase()} scraper`);
  }

  async login() {
    await super.login();
    // if you need to login, put that code here.
  }

  async generateListings() {
    await super.generateListings();
    // here is where you traverse the site and populate your this.Listings field with the listings.
  }

  async processListings() {
    await super.processListings();
    // here is where you do any additional processing on the raw data now available in the this.listings field.
  }

}
