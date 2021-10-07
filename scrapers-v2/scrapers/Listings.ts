// eslint-disable-next-line no-unused-vars
import { Listing } from './Listing';

const fs = require('fs');

/** Each instance holds an array of writeable Listing objects. */
export class Listings {
  private listings: Listing[];
  private listingDir: string;
  private name: string;
  private log;

  constructor({ listingDir, name, log }) {
    this.listingDir = listingDir;
    this.listings = [];
    this.name = name;
    this.log = log;
  }

  addListing(listing) {
    this.listings.push(listing);
  }

  writeListings() {
    try {
      const file = `${this.listingDir}/${this.name}.json`;
      const data = JSON.stringify(this.listings, null, 2);
      fs.writeFileSync(file, data, 'utf-8');
      this.log.info('Wrote data');
    } catch (error) {
      this.log.error(`Error in Listings.writeListings: ${error}`);
    }
  }
}
