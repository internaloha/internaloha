/**
 * Get the values associated with the passed selector and associated field.
 * Because we can't do closures with puppeteer, special arguments are needed to pass selector and field into page.evaluate().
 * See: https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pageevaluatepagefunction-args
 * Also: we have to create a returnVals variable and await it, then return it.
 * It's worth it because we call this function five times in generateListings.
 */
async function getValuesOLD(selector, field) {
  const returnVals = await this.page.evaluate((selector, field) => {
    const vals = [];
    const nodes = document.querySelectorAll(selector);
    nodes.forEach(node => vals.push(node[field]));
    return vals;
  }, selector, field);
  return returnVals;
}