# Scrapers V2

## Overview

Scrapers V2 reimplements the initial version of InternAloha's scrapers with:

  * Typescript rather than Javascript.
  * A Scraper superclass that provides a common structure for implementation of a scraper.
  * Use of [commander](https://www.npmjs.com/package/commander) for top-level CLI processing.

Most importantly, this version implements a "standard processing workflow" in the form of the scrape() method:

```js
async scrape() {
  await this.launch();
  await this.login();
  await this.generateListings();
  await this.processListings();
  await this.writeListings();
  await this.writeStatistics();
  await this.close();
}
```

Basically, you implement a scraper by overriding (or adding functionality to) the methods launch(), login(), generateListings(), etc. You shouldn't need to touch the scrape() method.

I have implemented one scraper (NSF) using this approach, and it seems to work. You can use it as a model for guiding your own scraper development.

## Installation

### Install libraries

To install libraries, change directories into `scrapers-v2`, then run

```
npm install
```

### Define config.json

To install the system, you must create a (git-ignored) configuration file. This file's name defaults to config.json. Currently, this file contains credentials necessary to run the Angel List and Student Opportunity Center scrapers.

You can copy sample.config.json to config.json to create a template version of this file. If you are running scrapers that don't require credentials, then the template will be sufficient.

Note: the syntax of the config.json file has changed slightly in V2. You can't simply copy over your previous config.json file. Instead, make a copy of sample.config.jons and update it manually from your V1 version.

### Fix chromium permissions (MacOS)

On recent versions of MacOS, there is an annoying popup window that appears each time puppeteer runs.  This problem is documented in [https://github.com/puppeteer/puppeteer/issues/4752](https://github.com/puppeteer/puppeteer/issues/4752).

If you are running MacOS, and get this popup, you can run the fix-chromium-permissions.sh script to address this problem. Note that if you reinstall Chromium (due to an update, for example), you will need to re-run the script.

After running the script, you may get the popup one final time.



## Invocation

### Default: `npm run scrape -- -s <scraper>`

This is the simplest version of the script, which runs a single scraper. For example:

```
npm run scrape -- -s nsf-reu
```

Currently, this command produces the following output:

```
$ npm run scrape -- -s nsf-reu

> scraper@2.0.0 scrape /Users/philipjohnson/github/internaloha/internaloha/scrapers-v2
> ts-node -P tsconfig.buildScripts.json main.ts "-s" "nsf-reu"

$
```

You will see that a file called `nsf.json` has been written to the `listings` directory.

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

I have finished a preliminary version of the NSF REU scraper which provides a proof-of-concept for the system.

Here is the default run of the scraper. The log level defaults to 'warn', so there's very little output.

```
$ npm run scrape -- -s nsf

> scraper@2.0.0 scrape /Users/philipjohnson/github/internaloha/internaloha/scrapers-v2
> ts-node -P tsconfig.buildScripts.json main.ts "-s" "nsf"
```

Running the scraper with log level 'info' produces a bit more output:

```
$ npm run scrape -- -s nsf -l info

> scraper@2.0.0 scrape /Users/philipjohnson/github/internaloha/internaloha/scrapers-v2
> ts-node -P tsconfig.buildScripts.json main.ts "-s" "nsf" "-l" "info"

15:44:32 INFO NSF Launching scraper.
15:44:36 INFO NSF Wrote data
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

## To Do

There are still things to do for the NSF scraper (and scraping in general):
  * I have not implemented a "processListings" method for the NSF scraper.
  * I have not yet implemented the statistics file.

I should be able to work on these issues concurrently while others implement scrapers without too much conflict.

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

Note that there is a CLI flag, --commit-files, which is false by default.  When --commit-files is false, the data files generated by running the system have the suffix '.dev.json', which is git-ignored in the listings/ and statistics/ directories. This is done so that all of us can run and develop each other's scrapers concurrently without creating a ton of merge errors in the data directories.




