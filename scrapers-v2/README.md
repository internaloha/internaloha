# Scrapers V2

## Overview

Scrapers V2 reimplements the initial version of InternAloha's scrapers with:

  * Typescript rather than Javascript.
  * A Scraper superclass that provides a common structure for implementation of a scraper. This design is documented in [https://github.com/radgrad/radgrad2/issues/726](https://github.com/radgrad/radgrad2/issues/726).
  * Sequential rather than parallel execution.
  * Use of [commander](https://www.npmjs.com/package/commander) for top-level CLI processing.

## Installation

Change directories into `scrapers-v2`, then run

```
npm install
```

## Invocation

### Default: `npm run scrape`

To run all of the scrapers, invoke:

```
npm run scrape
```

This invocation uses default values for `--scraper` (all) and `--log-level` (warn).  Currently, this command produces the following output:

```
$ npm run scrape

> scraper@2.0.0 scrape /Users/philipjohnson/github/internaloha/internaloha/scrapers-v2
> ts-node -P tsconfig.buildScripts.json main.ts
```

Ultimately, this is the command you will run most of the time, as it will invoke all of the scrapers and produce output only for warnings and errors.

### Option: --scraper

To run a specific scraper, add `--` and the `--scraper` parameter. For example, to run just the "testscraper" scraper, invoke:

```
npm run scrape -- --scraper testscraper
```

Currently, this command produces the following output:

```
$ npm run scrape -- --scraper testscraper

> scraper@2.0.0 scrape /Users/philipjohnson/github/internaloha/internaloha/scrapers-v2
> ts-node -P tsconfig.buildScripts.json main.ts "--scraper" "testscraper"
```

## Option: --log-level

The scraper uses the [log-level](https://www.npmjs.com/package/loglevel) package.

The default logging level is 'warn'.

To change the default logging level, use the `--log-level` parameter. For example:

```
npm run scrape -- --log-level info
```

When this command is invoked, it currently produces the following output:

```
$ npm run scrape -- --log-level info

> scraper@2.0.0 scrape /Users/philipjohnson/github/internaloha/internaloha/scrapers-v2
> ts-node -P tsconfig.buildScripts.json main.ts "--log-level" "info"

[14:11:20] INFO TestScraper Creating scraper: TestScraper
[14:11:20] INFO TestScraper2 Creating scraper: TestScraper2
[14:11:20] INFO TestScraper Starting login
[14:11:20] INFO TestScraper Starting search
[14:11:20] INFO TestScraper Starting next listing
[14:11:20] INFO TestScraper Starting parse listing
[14:11:20] INFO TestScraper Starting write listings
[14:11:20] INFO TestScraper Starting write statistics
[14:11:20] INFO TestScraper2 Starting login
[14:11:20] INFO TestScraper2 Starting search
[14:11:20] INFO TestScraper2 Starting next listing
[14:11:20] INFO TestScraper2 Starting parse listing
[14:11:20] INFO TestScraper2 Starting write listings
[14:11:20] INFO TestScraper2 Starting write statistics
```

You can combine this with the --scraper option to run a single scraper with additional output:

```
$ npm run scrape -- --log-level info --scraper testscraper2

> scraper@2.0.0 scrape /Users/philipjohnson/github/internaloha/internaloha/scrapers-v2
> ts-node -P tsconfig.buildScripts.json main.ts "--log-level" "info" "--scraper" "testscraper2"

[14:12:41] INFO TestScraper Creating scraper: TestScraper
[14:12:41] INFO TestScraper2 Creating scraper: TestScraper2
[14:12:41] INFO TestScraper2 Starting login
[14:12:41] INFO TestScraper2 Starting search
[14:12:41] INFO TestScraper2 Starting next listing
[14:12:41] INFO TestScraper2 Starting parse listing
[14:12:41] INFO TestScraper2 Starting write listings
[14:12:41] INFO TestScraper2 Starting write statistics
```

## Option: --help

Finally, you can find out about the current command line options with the `--help` option:

```
npm run scrape -- --help
```

For example:

```
$ npm run scrape -- --help

> scraper@2.0.0 scrape /Users/philipjohnson/github/internaloha/internaloha/scrapers-v2
> ts-node -P tsconfig.buildScripts.json main.ts "--help"

Usage: main [options]

Options:
  --scraper <scraper>  Run a specific scraper. (default: "all")
  --log-level <level>  One of: trace, debug, info, warn, error. (default: "warn")
  -h, --help           display help for command
```

## To Do

* Specify config file as a CLI param, initialize it in superclass.
* Set up the browser in the superclass.
* Set logging to trace




