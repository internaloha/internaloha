#!/usr/bin/env bash

npm run scrape -- -cf true -s nsf -ml 100
npm run scrape -- -cf true -s simplyhired -ml 1000
npm run scrape -- -cf true -s apple -ml 40
npm run scrape -- -cf true -s ziprecruiter -ml 100

npm run statistics -- -cf true
