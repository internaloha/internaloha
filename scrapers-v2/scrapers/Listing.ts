
export class Listing {
  public url: string;
  public position?: string;
  public location?: { city: string, state: string, country: string };
  public description?: string;
  public company?: string;
  public contact?: string;
  public posted?: string;
  public due?: string;
  public lastScraped: Date;

  constructor({ url, position = '', location = { city: '', state: '', country: ''}, description = '', company = '', contact = '', posted = '', due = '' }) {
    this.url = url;
    this.position = position;
    this.location = location;
    this.description = description;
    this.company = company;
    this.contact = contact;
    this.posted = posted;
    this.due = due;
    this.lastScraped = new Date();
  }
}
