# Scrapers V2

## Overview

Scrapers V2 reimplements the initial version of InternAloha's scrapers with:

  * Typescript rather than Javascript.
  * A Scraper superclass that provides a common structure for implementation of a scraper.
  * Use of [commander](https://www.npmjs.com/package/commander) for top-level CLI processing.

## Installation

### Install libraries

To install libraries, change directories into `scrapers-v2`, then run

```
npm install
```

### Define config.json

To install the system, you must create a (git-ignored) configuration file containing credentials. This file's name defaults to config.json. Currently, credentials must be specified for Angel List and Student Opportunity Center.

You can copy sample.config.json to config.json to create a template version of this file. If you are running scrapers that don't require credentials, then the template will be sufficient.

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


### Available options: `npm run scrape -- -h`

There are many options for customizing the run of a scraper.  To see them, invoke help:

```
npm run scrape -- --help
```

Here is the output from a prior run. There may be additional options or changes in your version.

```
$ npm run scrape -- -h

> scraper@2.0.0 scrape /Users/philipjohnson/github/internaloha/internaloha/scrapers-v2
> ts-node -P tsconfig.buildScripts.json main.ts "-h"

Usage: main [options]

Options:
  -s, --scraper <scraper>          Specify the scraper. (choices: "testscraper", "testscraper2", "nsf-reu")
  -l, --log-level <level>          Specify logging level (choices: "trace", "debug", "info", "warn", "error", default: "warn")
  -c, --config-file <config-file>  Specify config file name. (default: "config.json")
  -nh, --no-headless               Disable headless operation (display browser window during execution)
  -dt, --devtools                  Open a devtools window during run.
  -sm, --slowMo                    Pause each puppeteer action by the provided number of milliseconds. (default: "0")
  -h, --help                       display help for command
```

## Multi-scraper invocation

In the previous version of the scraper, we discovered that puppeteer is not "thread safe", in the sense that running multiple scrapers simultaneously can result in execution errors that do not appear when running each scraper individually.

To avoid this problem, the `scrape` script supports running of only a single scraper. To support batch execution of multiple scrapers, we recommend that you create an OS-level shell script that invokes the `scrape` script multiple times, once per scraper. This will isolate each run of the scraper in its own OS process and prevent these sorts of problems from occurring.





