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

  async autoscroll(){

    const scrollable_section = 'div[class="GridItem_gridItem__1MSIc GridItem_clearfix__4PbqP GridItem_clearfix__4PbqP"]';

    await this.page.waitForSelector('div[class="GridItem_gridItem__1MSIc GridItem_clearfix__4PbqP GridItem_clearfix__4PbqP"]');

    await this.page.evaluate(selector => {
      const scrollableSection = document.querySelector(selector);

      scrollableSection.scrollTop = scrollableSection.offsetHeight;
    }, scrollable_section);

    await this.page.focus(scrollable_section);
    await this.page.keyboard.press('Space');

    await this.page.waitForTimeout(8000);
  }

  async extractItems() {
    await this.page.waitForSelector('div[class="GridItem_jobContent__ENwap"]');
    const elements = await this.page.$$('div[class="GridItem_jobContent__ENwap"]');

    //Elements is an array of all the internship boxes 
    //const elements = await this.page.$$('div[class="GridItem_jobContent__ENwap"]');
    const items = [];

    for (let i = 0; i < elements; i++) {

      //This clicks on the boxes that are on the page idea for extract elements
      await this.page.waitForSelector(elements[i]);
      await this.page.click(elements[i]);
      await this.page.waitForTimeout(1000); //Have to wait till page is loaded might need a better way to do this
      console.log('HERE');

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

  async generateListings() {
    await super.generateListings();
    await this.page.goto('https://www.internships.com/app/search?keywords=computer+science&position-types=internship&location=Hawaii&context=seo&seo-mcid=33279397626109020301048056291448164886');

    await this.page.waitForTimeout(1000);


    //Elements is an array of all the internship boxes
    const elements = await this.page.$$('div[class="GridItem_jobContent__ENwap"]');
    const items = [];


    for (let i = 0; i < elements; i++) {

      //This clicks on the boxes that are on the page idea for extract elements
      await this.page.waitForSelector('div[class="GridItem_jobContent__ENwap"]');
      await elements[i].click();
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


  }

  async processListings() {
    await super.processListings();
    // here is where you do any additional processing on the raw data now available in the this.listings field.
  }

}
