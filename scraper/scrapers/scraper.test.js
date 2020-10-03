import { describe, it } from 'mocha';
import { simplyHired } from 'simplyHired';
import { assert } from 'chai';

/**
 * Not currently working.
 */
describe('Scraping...', function () {
  it('simplyHired | should return an array of object holding the internship data', function () {
    assert.isArray(simplyHired(), 'should return an array');
  });

});
