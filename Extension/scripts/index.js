(function() {
  const path = './scripts';
  let script = document.createElement('script')
  script.src = chrome.runtime.getURL(`${path}/script.js`)
  document.getElementsByTagName('body')[0].appendChild(script)

  script = document.createElement('script')
  script.src = chrome.runtime.getURL(`${path}/scrapbook.js`)
  document.getElementsByTagName('body')[0].appendChild(script)

  script = document.createElement('script')
  script.src = chrome.runtime.getURL(`${path}/playeritems.js`)
  document.getElementsByTagName('body')[0].appendChild(script)
})();