#!/usr/bin/env bash

npm run scrape -- -l info -cf true -s nsf -ml 100
npm run scrape -- -l info -cf true -s simplyhired -ml 1000

npm run statistics -- -cf true
