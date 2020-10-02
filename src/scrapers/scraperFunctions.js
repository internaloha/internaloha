module.exports = {

  /**
   * Fetches the information from the page.
   * @param page The page we are scraping
   * @param selector The CSS Selector
   * @param attributeType The attribute we want to get. Common ones are innerHTML, innerText, textContent
   * @returns {Promise<*>} The information as a String.
   */
  fetchInfo: async function fetchInfo(page, selector, attributeType) {
    let result = '';

    try {

      await page.waitForSelector(selector);
      // eslint-disable-next-line no-undef
      result = await page.evaluate((select, attribute) => document.querySelector(select)[attribute], selector, attributeType);

    } catch (error) {
      console.log('Our Error: fetchInfo() failed.\n', error.message);
      result = 'Error';
    }
    return result;
  },

  /**
   * Scrolls down a specific amount every 4 milliseconds.
   * @param page The page we are scrolling.
   * @returns {Promise<void>}
   */
  autoScroll: async function autoScroll(page) {
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
  },

};
