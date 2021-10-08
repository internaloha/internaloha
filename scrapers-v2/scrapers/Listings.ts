// eslint-disable-next-line no-unused-vars
import { Listing } from './Listing';

const fs = require('fs');

/** Each instance holds an array of writeable Listing objects. */
export class Listings {
  private commitFiles: boolean;
  private listings: Listing[];
  private listingDir: string;
  private name: string;
  private log;

  constructor({ listingDir, name, log, commitFiles }) {
    this.listingDir = listingDir;
    this.listings = [];
    this.name = name;
    this.log = log;
    this.commitFiles = commitFiles;
  }

  addListing(listing) {
    this.listings.push(listing);
  }

  writeListings() {
    try {
      const suffix = this.commitFiles ? 'json' : 'dev.json';
      const file = `${this.listingDir}/${this.name}.${suffix}`;
      const data = JSON.stringify(this.listings, null, 2);
      fs.writeFileSync(file, data, 'utf-8');
      this.log.info('Wrote data');
    } catch (error) {
      this.log.error(`Error in Listings.writeListings: ${error}`);
    }
  }
}
