function getJobURLsOnCurrentPage() {
  let jobLinkSelector = "a[class='styles_component__1c6JC styles_defaultLink__1mFc1 styles_information__1TxGq']";
  let jobNodeList = document.querySelectorAll(jobLinkSelector);
  return Array.from(jobNodeList).map(node => node.href);
}

console.log(getJobURLsOnCurrentPage()); 
