async function getData(page, selector, DOM_Element) {
  return page.evaluate(() => {
    const results = document.querySelectorAll(selector);
    log.info('-----------');
    log.info(selector);
    const resultList = [...results];
    return resultList.map((res) => res[DOM_Element]);
  });
}

const urls = await getData(page, 'td[data-label="Site Information: "] > div > a', 'href');
const position = await getData(page, 'td[data-label="Site Information: "] > div > a', 'innerText');
const company = await getData(page, 'td[data-label="Site Information: "] > div > strong', 'innerText');
const description = await getData(page, 'td[data-label="Additional Information: "] > div ', 'innerHTML');
const location = await getData(page, 'td[data-label="Site Location: "] > div', 'innerText');