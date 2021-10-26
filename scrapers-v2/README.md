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

### Tip 1: Use log levels appropriately

While a quick console.log() can be useful during development, please remove them before committing to master. Instead, you should use the built-in logging system to output information to the console according to the following guidelines:

`this.log.error()`. When you want to indicate that a non-recoverable error has occurred, call `this.log.error()`. That said, it's probably more convenient to simply throw an Error for code in `login()`, `launch()`, `generateListings()`, or `processListings()`. That's because these errors will be caught by the superclass and a `this.log.error()` will be invoked automatically.

`this.log.warn()`.  When something exceptional happens that you think should be highlighted, use `this.log.warn()`.  This logging level is also used to indicate that a scraper has started.  Running a scraper with logging set to `warn` means that there will typically be only one line of output under normal conditions.

`this.log.info()`. This is the default level of logging. The goal of "info" logging is to provide the user with feedback that enables them to know that the scraper is making progress, but without overwhelming them with output. Try to be judicious. For example, if your scraper is normally going to go through 90 pages, maybe emit an info message every 5 or 10 pages so that there aren't 90 lines of output.

`this.log.debug()`. You can emit as much output as you want at the debug level. Note that the Scraper superclass sets up an event handler such that all output to the puppeteer console is logged at the debug level. So, when you run a scraper with logging set to debug, you might get lines of output similar to this:

```
09:38:07 DEBUG LINKEDIN PUPPETEER CONSOLE: visitor.publishDestinations() result: The destination publishing iframe is already attached and loaded.
09:38:07 DEBUG LINKEDIN PUPPETEER CONSOLE: Failed to load resource: the server responded with a status of 400 ()
```

It can be very informative to see what is being printed to the puppeteer console, although some of this output might not have been generated by your scraper!

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

### Tip 4: Prefer await super.getValues()

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

### Tip 6: Prefer await super.selectorExists()

There are lots of situations in which you want to do some processing as long as there's at least one occurrence of a selector on the page.  Because this is such a common pattern, the Scraper superclass provides a simple method for this:

```
/**
 * Return true if the passed selector appears on the page.
 */
async selectorExists(selector) {
  return !! await this.page.$(selector);
}
```

This makes it more readable to write loops:

```
const listingSelector = '#listing';

this.page.goto(getUrl());
while (await super.selectorExists(listingSelector)) {
  // process listings on this page.
  this.page.goto(getNextUrl());
}
```

### Tip 7: Be kind to future you

"Future you" refers to you in several months when you have been working on other things, but have to come back to fix a broken scraper.  Being kind of future you means structuring your code in such a way that it is easier to re-understand.  Here are some tips:

#### Provide meaningful variable names to document "magic" strings

Consider the following line of code:

```
await this.page.waitForSelector('a[class="styles_component__1c6JC styles_defaultLink__1mFc1 styles_information__1TxGq"]');
```

What, precisely are we waiting for?  The problem here is that the meaning of this selector string is opaque: it doesn't provide us with any information about what it is, where it might be, and why we might be waiting for it.

One good way to fix this is to assign that string to a variable whose name provides more information:

```
const internshipLink = 'a[class="styles_component__1c6JC styles_defaultLink__1mFc1 styles_information__1TxGq"]';
await this.page.waitForSelector(internshipLink);
```

A benefit of this approach over simply adding a comment string is that if you want to inspect the page manually using DevTools, you can simply copy-and-paste the line containing the variable definition into the DevTools console, which makes it easy to replicate the query using non-Puppeteer Dev Tools operations such as:

```
document.querySelector(internshipLink)
```

#### Avoid deep nesting

If your code has an if statement inside a while loop inside an if statement, for example, it will be hard to read.

In these cases, think about how to modularize your code. Maybe there is a block of code that can be refactored into a private method with a useful return value.  That is useful for understanding, and also for debugging.

## Tip 8: Don't use try-catch to provide "normal" control flow

Consider the following code:

```js
try {
  // Click the "Load More" button
  await this.page.click('.load_more_jobs');
} catch (err) {
  this.log.debug('--- All jobs are Listed, no "Load More" button --- ');
}
```

What is problematic about this code is that it is not an error for a page to not have a Load More button. So, the use of try-catch is not appropriate.

In this case, what is needed is to test whether or not the selector exists and only click it if so:

```js
const loadJobsSelector = 'load_more_jobs';
if (await super.selectorExists(loadJobsSelector) {
  await this.page.click(`.${loadJobsSelector}`;
}
```

It doesn't seem particularly interesting to provide the debugging log statement, so I've omitted it, but you could add it back in if you really wanted it as an else clause.

## Tip 9: "Error: Navigation failed because browser has disconnected!"

Are you experiencing an intermittent error similar to this?

```
10:37:59 ERROR APPLE Execution context was destroyed, most likely because of a navigation.
(node:95928) UnhandledPromiseRejectionWarning: Error: Navigation failed because browser has disconnected!
    at /Users/philipjohnson/github/internaloha/internaloha/scrapers-v2/node_modules/puppeteer/lib/cjs/puppeteer/common/LifecycleWatcher.js:51:147
```

According to [this stackoverflow page](https://stackoverflow.com/questions/54527982/why-is-puppeteer-reporting-unhandledpromiserejectionwarning-error-navigation), *The "Navigation failed because browser has disconnected" error usually means that the node scripts that launched Puppeteer ends without waiting for the Puppeteer actions to be completed.*

The stackoverflow answer goes on to debug the specific code in question, but there is a much more general answer:

*Be sure that you preface every Puppeteer operation (i.e. `this.page.<operation>`) with `await`.*

For example, there was some scraper code that generated this error occasionally. On review, the following lines were discovered:

```js
this.page.goto(pageUrl(++pageNum), {waitUntil: 'networkidle2'});
await this.page.waitForTimeout(3000);
```

Because the `this.page.goto` was not proceeded with an `await`, that line of code returned immediately. The next line of code forced a wait of 3 seconds, which might or might not be enough time for the `goto` to complete successfully. If it is enough time, then everything would be OK. If it is not enough time, then we'd get the error.

The solution is to simply add the `await`, which also means we don't need the `waitForTimeout`:

```js
await this.page.goto(pageUrl(++pageNum), {waitUntil: 'networkidle2'});
```

So, if you are getting this error intermittently, a quick thing to do is a search for every occurrence of `this.page` in your scraper code, and verify that every occurrence of `this.page` is preceded by `await`.

## Tip 10: How to determine if a page has finished loading

One issue with scraper design is to ensure that the scraper does not try to operate on a page until it has loaded.

A common strategy in prior scraper implementations is to liberally insert code to insert pauses into script execution. For example, the following code pauses the script for 3 seconds each time it is executed:

```
await this.page.waitForTimeout(3000);
```

There are two problems with this approach:
  1. It is hard to figure out the appropriate length of time to pause. Is 3 seconds enough for all situations?
  2. It might slow down script execution significantly. If you insert a 3 second pause into a loop for each listing, and there are 500 listings, then you've just forced your script to require a minimum of 1500 seconds to execute.

Some times these pauses are inserted to mimic human "speed" of page manipulation, but this is only needed for a few scrapers. More often, these pauses end up being inserted as a way to wait until the page is loaded.

[This stackoverflow page](https://stackoverflow.com/questions/52497252/puppeteer-wait-until-page-is-completely-loaded) has a number of comments regarding this issue.  From it, we can get a number of hints about how to best wait until a page has loaded.

### Case 1: When you know a selector will exist on the page

If you are **sure** that a page, when finally loaded, will contain the selector of interest, then your best approach is to use [page.waitForSelector()](https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pagewaitforselectorselector-options). By default, the timeout is '0', which means that this command will wait indefinitely for the selector to be present on the page.

### Case 2: When you know a selector will exist on the page

If you are **sure** that a page, when finally loaded, will contain the selector of interest, then your best approach is to use [page.waitForSelector()](https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pagewaitforselectorselector-options). By default, the timeout is '0', which means that this command will wait indefinitely for the selector to be present on the page.

If you are not sure that the selector of interest will exist, then things are more complicated, since you don't know if the absence of the selector is due to the selector not being present or the page not having completed loading.

First, it is important to understand that completing the "loading" process has two phases:

  1. Complete the downloading of all page resources (HTML, Javascript, Images, etc) from the server over the network.
  2. Complete the execution of all Javascript scripts on the page, since these scripts might create DOM elements.

To address (1), you can use the `waitUntil` option of commands like `page.goto`, as documented [here](https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pagegotourl-options).  If you experience loading issues, then you might add this option with a value of `networkidle0`.  Please note that you do not need to set `timeout`, as it is set to `0` globally by the scraper superclass.

In some cases, a page might have time-consuming Javascript scripts that execute. If you can verify that this is an issue in the site you are scraping, then you might want to consider the `waitTillHTMLRendered` function, documented in [this stackoverflow answer](https://stackoverflow.com/a/61304202/2038293).


