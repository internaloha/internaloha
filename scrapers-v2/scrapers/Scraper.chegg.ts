import { Listing } from './Listing';
import { Scraper } from './Scraper';

const prefix = require('loglevel-plugin-prefix');


export class CheggScraper extends Scraper {
  constructor() {
    super({ name: 'chegg', url: 'https://www.internships.com/app/search' });
  }

  async launch() {
    await super.launch();
    prefix.apply(this.log, { nameFormatter: () => this.name.toUpperCase() });
    this.log.warn(`Launching ${this.name.toUpperCase()} scraper`);
  }

  async login() {
    await super.login();
  }

  async extractItems() {

    console.log("IAMHERE");
    
    await this.page.waitForSelector('div[class="GridItem_jobContent__ENwap"]');

    //Elements is an array of all the internship boxes 
    const elements = await this.page.$$('div[class="GridItem_jobContent__ENwap"]');

    console.log(elements.length);
    
    const items = [];

    for (let i = 0; i < elements; i++) {


      //This clicks on the boxes that are on the page idea for extract elements
      await this.page.waitForSelector(elements[i]);
      await this.page.click(elements[i]);
      await this.page.waitForTimeout(1000); //Have to wait till page is loaded might need a better way to do this

      let url = this.page.url();

      const position = (await super.getValues('h1[class="DesktopHeader_title__2ihuJ"]', 'innerText'))[0];

      const description = (await super.getValues('div[class="ql-editor ql-snow ql-container ql-editor-display '+        'Body_rteText__U3_Ce"]', 'innerText'))[0];

      const company = (await super.getValues('a[class="Link_anchor__1oD5h Link_linkColoring__394wp ' +
        'Link_medium__25UK6     DesktopHeader_subTitle__3k6XA"]', 'innerText'))[0];

      const location = (await super.getValues('span[class="DesktopHeader_subTitle__3k6XA ' +
        'DesktopHeader_location__3jiWp"]', 'innerText'));

      const listing = new Listing({ url, position, location, company, description });
      this.listings.addListing(listing);
      
      items.push(listing);
    }
    return items;
  }

  async scrapeItems(
    page,
    extractItems,
    itemCount,
    scrollDelay = 800,
  ) {
    let items = [];
    try {
      let previousHeight;
      console.log('HERE');
      while (items.length < itemCount) {
        items = await page.evaluate(extractItems);
        console.log('items');
        console.log(items);

        previousHeight = await page.evaluate('document.body.scrollHeight');

        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');

        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);

        await page.waitForTimeout(scrollDelay);
      }
    } catch (e) { }
    return items;
  }

  async generateListings() {
    await super.generateListings();
    await this.page.goto('https://www.internships.com/app/search?keywords=computer+science&position-types=internship&location=Hawaii&context=seo&seo-mcid=33279397626109020301048056291448164886');

    await this.page.reload();

    await this.page.waitForSelector('div[class="GridItem_jobContent__ENwap"]');

    const items = await this.scrapeItems(this.page, this.extractItems, 700);
    console.log(items);

    await this.page.waitForTimeout(8000);

  }

  async processListings() {
    await super.processListings();
    // here is where you do any additional processing on the raw data now available in the this.listings field.
  }

}
