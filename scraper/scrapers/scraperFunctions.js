/**
 * Fetches the information from the page.
 * @param page The page we are scraping
 * @param selector The CSS Selector
 * @param DOM_Element The DOM element we want to use. Common ones are innerHTML, innerText, textContent
 * @returns {Promise<*>} The information as a String.
 */
async function fetchInfo(page, selector, DOM_Element) {
  let result = '';

  try {

    await page.waitForSelector(selector, { timeout: 10000 });
    // eslint-disable-next-line no-undef
    result = await page.evaluate((select, element) => document.querySelector(select)[element], selector, DOM_Element);

  } catch (error) {
    console.log('Our Error: fetchInfo() failed.\n', error.message);
    result = 'Error';
  }
  return result;
}

/**
 * Scrolls down a specific amount every 4 milliseconds.
 * @param page The page we are scrolling.
 * @returns {Promise<void>}
 */
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 400);
    });
  });
}

export { fetchInfo, autoScroll };
