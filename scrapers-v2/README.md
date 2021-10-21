# Scrapers V2

## Overview

Scrapers V2 reimplements the initial version of InternAloha's scrapers with:

  * Typescript rather than Javascript.
  * A Scraper superclass that provides a common structure for implementation of a scraper.
  * Use of [commander](https://www.npmjs.com/package/commander) for top-level CLI processing.
  * Structural support for multiple disciplines (i.e. scraping for computer science, for computer engineering, etc.)
  * Automatic generation of scraper statistics

Most importantly, this version implements a "standard processing workflow" in the form of the scrape() method:

```js
async scrape() {
  try {
    await this.launch();
    await this.login();
    await this.generateListings();
    await this.processListings();
  } catch (error) {
    const message = error['message'];
    this.errorMessages.push(message);
    this.log.error(message);
  } finally {
    await this.close();
    await this.writeListings();
    await this.writeStatistics();
  }
}
```

Basically, you implement a scraper by overriding (or adding functionality to) the methods launch(), login(), generateListings(), etc. You shouldn't need to touch the scrape() method.

The standard processing workflow will catch any errors thrown during launch(), login(), generateListings(), and processListings(). (We don't expect errors during close(), writeListings(), or writeStatistics().) A scraper should not implement try-catch blocks unless they are able to handle the error and continue processing. If an error is encountered, then it will be printed out to the console and indicated in the statistics file generated for that run.

I have implemented one scraper (NSF) using this approach, and it seems to work. You can use it as a model for guiding your own scraper development.

## Installation

### Install libraries

To install libraries, change directories into `scrapers-v2`, then run

```
npm install
```

### Define config.json

To run the scraper script, you must provide a (git-ignored) configuration file. This file's name defaults to config.json. Currently, this file contains credentials necessary to run the Angel List and Student Opportunity Center scrapers.

You can copy sample.config.json to config.json to create a template version of this file. If you are running scrapers that don't require credentials, then copying the template will be sufficient. Otherwise, you have to edit this file and provide your own credentials to log into the site that will be scraped.

Note: the syntax of the config.json file has changed slightly in V2. You can't simply copy over your previous config.json file. Instead, make a copy of sample.config.jons and update it manually from your V1 version.

### Fix chromium permissions (MacOS)

On recent versions of MacOS, there is an annoying popup window that appears each time puppeteer runs.  This problem is documented in [https://github.com/puppeteer/puppeteer/issues/4752](https://github.com/puppeteer/puppeteer/issues/4752).

If you are running MacOS, and get this popup, you can run the fix-chromium-permissions.sh script to address this problem. Note that if you reinstall Chromium (due to an update, for example), you will need to re-run the script.

After running the script, you may get the popup one final time.

## Invocation

### Default: `npm run scrape -- -s <scraper>`

This is the simplest version of the script, which runs a single scraper. For example:

```
npm run scrape -- -s nsf
```

Currently, this command produces the following output:

```
$ npm run scrape -- -s nsf

> scraper@2.0.0 scrape
> ts-node -P tsconfig.buildScripts.json scrape.ts "-s" "nsf"

11:42:19 WARN NSF Launching NSF scraper
11:42:22 WARN NSF Writing 100 listings
$
```

You will see that a file called `nsf.dev.json` has been written to the `listings/compsci` directory, and a file called (for example) `nsf-2021-10-18.dev.json` has been written to the `statistics/compsci` directory.

### Available options: `npm run scrape -- -h`

There are many options for customizing the run of a scraper.  To see them, invoke help:

```
npm run scrape -- --help
```

Here is the output from a recent run. There may be additional options or changes in your version.

```
$ npm run scrape -- -h

> scraper@2.0.0 scrape /Users/philipjohnson/github/internaloha/internaloha/scrapers-v2
> ts-node -P tsconfig.buildScripts.json main.ts "-h"

Usage: main [options]

Options:
  -s, --scraper <scraper>                Specify the scraper. (choices: "template", "nsf")
  -l, --log-level <level>                Specify logging level (choices: "trace", "debug", "info", "warn", "error", default: "warn")
  -d, --discipline <discipline>          Specify what types of internships to find (choices: "compsci", "compeng", default: "compsci")
  -cf, --config-file <config-file>       Specify config file name. (default: "config.json")
  -nh, --no-headless                     Disable headless operation (display browser window during execution)
  -dt, --devtools                        Open a devtools window during run. (default: false)
  -cf, --commit-files                    Write listing and statistic files that are not git-ignored. (default: false)
  -sm, --slowMo <milliseconds>           Pause each puppeteer action by the provided number of milliseconds. (default: "0")
  -t,  --default-timeout <seconds>       Set default timeout in seconds for puppeteer. (default: "0")
  -ld, --listing-dir <listingdir>        Set the directory to hold listing files. (default: "./listings")
  -ml, --minimum-listings <minlistings>  Throw error if this number of listings not found. (default: "10")
  -sd, --statistics-dir <statisticsdir>  Set the directory to hold statistics files. (default: "./statistics")
  -vph, --viewport-height <height>       Set the viewport height (when browser displayed). (default: "700")
  -vpw, --viewport-width <width>         Set the viewport width (when browser displayed). (default: "1000")
  -h, --help                             display help for command
```

You can provide any combination of these parameters, in any order.  The only required parameter is the scraper.

## Why no multi-scraper invocation?

In the previous version of the scraper, we discovered that puppeteer is not "thread safe", in the sense that running multiple scrapers simultaneously can result in execution errors that do not appear when running each scraper individually.

To avoid this problem, the `scrape` script supports running of only a single scraper. To support batch execution of multiple scrapers, we recommend that you create an OS-level shell script that invokes the `scrape` script multiple times, once per scraper. This will isolate each run of the scraper in its own OS process and prevent these sorts of problems from occurring.

## Example: NSF REU Scraper

Here is the default run of the NSF scraper. The log level defaults to 'info', so there's very little output.

```
$ npm run scrape -- -s nsf

> scraper@2.0.0 scrape
> ts-node -P tsconfig.buildScripts.json scrape.ts "-s" "nsf"

12:21:06 WARN NSF Launching NSF scraper
12:21:10 INFO NSF Wrote 100 listings.
12:21:10 INFO NSF Wrote statistics.
```

Running the scraper with log level 'debug' produces a lot of output, much of which I'll elide:

```
$ npm run scrape -- -s nsf -l debug

> scraper@2.0.0 scrape /Users/philipjohnson/github/internaloha/internaloha/scrapers-v2
> ts-node -P tsconfig.buildScripts.json main.ts "-s" "nsf" "-l" "debug"

15:45:17 DEBUG root Starting launch
15:45:18 INFO NSF Launching scraper.
15:45:18 DEBUG NSF Starting login
15:45:20 DEBUG NSF Starting generate listings
15:45:22 DEBUG NSF URLS:
https://engineering.asu.edu/sensip/reu-index-html/,https://web.asu.edu/imaging-lyceum/visual-media-reu,http://www.eng.auburn.edu/comp/research/impact/,http://www.eng.auburn
 :
 :
15:45:22 DEBUG NSF Positions:
Sensor Signal and Information Processing (SenSIP),Computational Imaging and Mixed-Reality for Visual Media Creation and Visualization,Research Experience for Undergraduate on Smart UAVs,REU Site: Parallel and Distributed Computing,Data-driven Security,Undergraduate Research Experiences in Big Data Security and Privacy,
  :
  :
15:45:22 DEBUG NSF Descriptions:
Research Topics/Keywords: Sensors and signal processing algorithms, sensor design and fabrication, signal processing, wearable and flexible sensors, machine learning, interface circuits, sensors for Internet of Things
 :
 :
15:45:22 DEBUG NSF Locations:
Tempe, Arizona,Arizona,Auburn, Alabama,Auburn, Alabama,Boise, Idaho,Pomona, California,Pittsburgh, Pennsylvania,Pittsburgh, Pennsylvania,Potsdam, New York
 :

15:45:22 DEBUG NSF Starting processListings
15:45:22 DEBUG NSF Starting write listings
15:45:22 INFO NSF Wrote data
15:45:22 DEBUG NSF Starting write statistics
15:45:22 DEBUG NSF Starting close
```

## Multi-discipline support

The scrape script provides a --discipline parameter that defaults to "compsci" but also supports "compeng". The value of this parameter is available to each scraper in a field called "discipline".  Each scraper can consult the value of the discipline field and alter their search behavior if they want to implement discipline-specific internship listings.

The discipline parameter also affects where the choice of directory where the listing and statistics files are written. The compsci files are written into `listings/compsci` and `statistics/compsci`. The compeng files are written into `listings/compeng` and `statistics/compeng`.

At this time, the scrapers do not change their behavior according to the value of the --discipline parameter. So, if you call the scrape script with "--discipline compeng", the only impact will be to write out the listing and statistics files to a different subdirectory.

## Generating statistics

Each time you run a scraper, a json file is written to a subdirectory of `/statistics` containing information about that run. The file name contains the timestamp YYYY-MM-DD, so statistics are only maintained for the last run of the day.

For example, here are the contents of `statistics/compsci/nsf-2021-10-08.dev.json`:

```
{
  "date": "2021-10-08",
  "elapsedTime": 5,
  "numErrors": 0,
  "numListings": 99,
  "scraper": "nsf",
  "errorMessages": []
}
```

You can run the "statistics" script to read all of the files in the statistics directory and generate a set of CSV files that provide historical trends for the scrapers:

```
$ npm run statistics

> scraper@2.0.0 statistics /Users/philipjohnson/github/internaloha/internaloha/scrapers-v2
> ts-node -P tsconfig.buildScripts.json statistics.ts

Wrote statistics/compsci/statistics.num-listings.dev.csv.
Wrote statistics/compsci/statistics.num-errors.dev.csv.
Wrote statistics/compsci/statistics.elapsed-time.dev.csv.
```

These files are designed to open in a spreadsheet program. For example, here are the contents of statistics.elapsed-time.dev.csv:

```
scraper,2021-10-08,2021-10-09,2021-10-10
nsf,5,3,3
```

Since only one scraper is implemented and has data available for it, the csv file contains only two rows: a header row, and a single data row containing available information for three days in which the NSF scraper was invoked.

## Development mode (don't commit output files)

During development, people will be running scrapers and generating both listing and statistics "output" files in their branches.  This could lead to lots of spurious merge conflicts when trying to merge your branches back into main.

To avoid this problem, both the scrape and statistics scripts have a flag called "--commit-files" which is (currently) false by default.  When false, all listing file names have a ".dev.json" suffix, and all statistics file names have a ".dev.csv" suffix.  Both of these suffixes are git-ignored, with the result that all output files you create during development are not committed to your branch or to main.

If you want your data files to be committed, then you just run either script with the option "--commit-files", which makes that flag true. Then the associated output files are created with ".json" (rather than ".dev.json") or ".csv" (rather than ".dev.csv"), and so they will not be git-ignored.

## Implement your own scraper.

First, check to make sure that you can run the NSF scraper successfully in your own environment. I suggest you read through the `Scraper.ts` and `Scraper.nsf.ts` files and make sure you understand the superclass and subclass relationship.  Notice how the NSF scraper methods frequently call the superclass method initially, then augment this behavior with additional code.

Next, make a copy of `scrapers/Scraper.template.ts`, and replace 'template' by the name of your scraper. So, for example, `Scraper.glassdoor.ts`. Edit the file as follows:

  * Fix the class name (for example, to "GlassDoorScraper")
  * Fix the name field on line 7 from 'template' to your scraper name (for example, to 'glassdoor'). Keep the scraper name lower case, all one word, no hyphens. This will make it easier for the CLI.

Next, update `main.ts` so that the CLI knows about your scraper. Edit the file as follows:

  * Add an import of your new scraper (for example, `import { GlassDoorScraper } from './scrapers/Scraper.glassdoor';`)
  * Update the `scrapers` object definition to include a new field and value for your scraper. For example, `glassdoor: new GlassDoorScraper(),`

Next, test the CLI to see if it understands your scraper. For example:

```
npm run scrape -- -s glassdoor -l debug
```

You should get a few lines of output and no errors.

Finally, the "easy" part. Migrate the scraper code from the old version of the system into this new format.  There are some CLI options to help you, such as `--no-headless`, `--devtools`, `--slowmo`, and so forth.

Check out the nsf scraper for hints.  There is some code (such as the array spread operator) which works in the old version of the system, but which I had to replace with a call to forEach in version 2 since the new version uses Typescript.  If you run into difficulties where code works in the old version but not here and you can't figure it out, don't hesitate to ask for help.

To see if your scraper is working, compare the output file it writes into the listings directory to the output file in scraper/data/canonical. Note that there are a few fields (start, end, compensation, qualifications, skills, remote) that are not currently of interest.  Use the type definition of the Listing object to see what fields we are currently hoping to extract.

Make sure that your code passes lint:

```
npm run lint
```

## Running the scrapers "in production"

There is a bash script called `run-scrapers.sh` that is intended to invoke all of the scrapers in "production mode" and then generate statistics.  Currently, it looks like this:

```sh
npm run scrape -- -l info -cf true -s nsf -ml 100
npm run scrape -- -l info -cf true -s simplyhired -ml 1000

npm run statistics -- -cf true
```

One important thing to note is that the --commit-files parameter is set to true, so the listings and statistics files will be committed to github.

For now, it seems like "info" logging provides the most appropriate feedback on progress, although maybe that will change i future.

## Developer Tips

### Tip 1: Use logging levels appropriately

While a quick console.log() can be useful during development, please remove them before committing to master. Instead, you should use the built-in logging system to output information to the console according to the following guidelines:

`this.log.error()`. When you want to indicate that a non-recoverable error has occurred, call `this.log.error()`. That said, it's probably more convenient to simply throw an Error for code in `login()`, `launch()`, `generateListings()`, or `processListings()`. That's because these errors will be caught by the superclass and a `this.log.error()` will be invoked automatically.

`this.log.warn()`.  When something exceptional happens that you think should be highlighted, use `this.log.warn()`.  This logging level is also used to indicate that a scraper has started.  Running a scraper with logging set to `warn` means that there will typically be only one line of output under normal conditions.

`this.log.info()`. This is the default level of logging. The goal of "info" logging is to provide the user with feedback that enables them to know that the scraper is making progress, but without overwhelming them with output. Try to be judicious. For example, if your scraper is normally going to go through 90 pages, maybe emit an info message every 5 or 10 pages so that there aren't 90 lines of output.

`this.log.debug()`. You can emit as much output as you want at the debug level.

`this.log.trace()`. Calling this will emit a stack trace at the moment of invocation.

So, for example, here is the default output for the NSF scraper:

```
$ npm run scrape -- -s nsf

> scraper@2.0.0 scrape
> ts-node -P tsconfig.buildScripts.json scrape.ts "-s" "nsf"

12:21:06 WARN NSF Launching NSF scraper
12:21:10 INFO NSF Wrote 100 listings.
12:21:10 INFO NSF Wrote statistics.
```

Since this scraper runs quickly, there's no need to augment the built-in logging messages.

On the other hand, the Simply Hired scraper default (info) output might best look like this:

```
$ npm run scrape -- -s simplyhired

> scraper@2.0.0 scrape
> ts-node -P tsconfig.buildScripts.json scrape.ts "-s" "simplyhired"

12:24:03 WARN SIMPLYHIRED Launching SIMPLYHIRED scraper
12:24:23 INFO SIMPLYHIRED Processed page 1, 19 internships
12:26:07 INFO SIMPLYHIRED Processed page 10, 152 internships
12:27:49 INFO SIMPLYHIRED Processed page 20, 279 internships
12:29:23 INFO SIMPLYHIRED Processed page 30, 399 internships
12:30:59 INFO SIMPLYHIRED Processed page 40, 519 internships
12:32:38 INFO SIMPLYHIRED Processed page 50, 646 internships
12:34:37 INFO SIMPLYHIRED Processed page 60, 798 internships
12:36:59 INFO SIMPLYHIRED Processed page 70, 983 internships
12:39:15 INFO SIMPLYHIRED Processed page 80, 1163 internships
12:41:28 INFO SIMPLYHIRED Processed page 90, 1343 internships
12:41:54 INFO SIMPLYHIRED Reached the end of pages!
12:41:54 INFO SIMPLYHIRED Wrote 1377 listings.
12:41:54 INFO SIMPLYHIRED Wrote statistics.
```

In this case, there's about 90 seconds delay between each line of output. You can write code like this to elide output in info mode but print it all out in debug mode.

```
const message = `Processed page ${totalPages}, ${internshipsPerPage} internships`;
((totalPages === 1) || (totalPages % 10 === 0)) ? this.log.info(message) : this.log.debug(message);
```

### Tip 2: Read the puppeteer documentation

It's actually quite informative to read the Puppeteer documentation at [https://pptr.dev/](https://pptr.dev/).

I recommend reading the intro section, and then the [Page](https://pptr.dev/#?product=Puppeteer&version=v10.4.0&show=api-class-page) API page, as that is the API you will be using most frequently.

### Tip 3: Avoid `page.evaluate()`

The FAQ section of [https://pptr.dev/](https://pptr.dev/) has a question entitled "What’s the difference between a “trusted" and "untrusted" input event?". It turns out that to avoid sites from blocking us as robots, we should always generate "trusted" events. This means that we should avoid the use of `page.evaluate()`, which generates untrusted events. Here's a quote from the docs:

*For automation purposes it’s important to generate trusted events. All input events generated with Puppeteer are trusted and fire proper accompanying events. If, for some reason, one needs an untrusted event, it’s always possible to hop into a page context with page.evaluate and generate a fake event:*

```js
await page.evaluate(() => {
  document.querySelector('button[type=submit]').click();
});
```

We definitely want to avoid "fake events", because certain sites might use them to bar us from scraping them. Note that it's OK to use page.evaluate() if you aren't generating events (i.e. you are just inspecting the page contents).  You should avoid things like .click() inside page.evaluate().

### Tip 4: Prefer super.getValues()

Many scrapers implement code similar to this:

```js
async oldVersionOfGetValues(selector, field) {
  const returnVals = await this.page.evaluate((selector, field) => {
    const vals = [];
    const nodes = document.querySelectorAll(selector);
    nodes.forEach(node => vals.push(node[field]));
    return vals;
  }, selector, field);
  return returnVals;
}
```

I then discovered after studying the Puppeteer documentation that it could be replaced with a one-liner using `page.$$eval`:

```js
async getValues(selector, field) {
  return await this.page.$$eval(selector, (nodes, field) => nodes.map(node => node[field]), field);
}
```

This is used sufficiently often that it is now present in the Scraper.ts superclass. So, you should replace code similar to oldVersionOfGetValues with super.getValues().

### Tip 5: Page navigation pattern

There is a standard pattern for when your script performs an action (such as logging in or clicking a button) that results in page navigation. It looks like this:

```js
await Promise.all([
  this.page.click('input[class="c-button c-button--blue s-vgPadLeft1_5 s-vgPadRight1_5"]'),
  this.page.waitForNavigation()
]);
```

The idea is that you have to combine the page.waitForNavigation() with the page.click() (or whatever) in a Promise.all() so that you don't proceed to the next command until both have completed. Doing them serially won't work.

For more details, see [https://pptr.dev/#?product=Puppeteer&version=v10.4.0&show=api-pagewaitfornavigationoptions](https://pptr.dev/#?product=Puppeteer&version=v10.4.0&show=api-pagewaitfornavigationoptions).

Note: if you use `page.goto()`, you don't need to add `page.waitForNavigation()`.  See [https://stackoverflow.com/a/57881877/2038293](https://stackoverflow.com/a/57881877/2038293) for details.





`



