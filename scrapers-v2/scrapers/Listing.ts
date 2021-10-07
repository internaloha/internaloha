export class Listing {
  public url: string;
  public position: string;
  public location: { city: string, state: string };
  public description: string;
  public lastScraped: Date;

  constructor({ url, position, location, description }) {
    this.url = url;
    this.position = position;
    this.location = location;
    this.description = description;
    this.lastScraped = new Date();
  }
}
