#!/usr/bin/env bash

# Stop MacOS from popping up the Firewall access window each time you run puppeteer.
# After running this script, you may get the popup one final time.
# Details: https://github.com/puppeteer/puppeteer/issues/4752#issuecomment-923629878

sudo codesign --force --deep --sign - ./node_modules/puppeteer/.local-chromium/mac-*/chrome-mac/Chromium.app
