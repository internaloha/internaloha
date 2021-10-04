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

This invocation uses default values for `--scraper` and `--log-level`


### Option: --scraper

To run a specific scraper, add `--` and the `--scraper` parameter. For example, to run just the nsf-reu scraper, invoke:

```
npm run scrape -- --scraper nsf-reu
```

## Option: --log-level

The scraper uses the [log-level](https://www.npmjs.com/package/loglevel) package.

The default logging level is 'warn'.

To change the default logging level, use the `--log-level` parameter. For example:

```
npm run scrape -- --log-level info
```

## Option: --help

See the current command line options with the `--help` option:

```
npm run scrape -- --help
```






