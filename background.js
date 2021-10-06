chrome.runtime.onInstalled.addListener(() => {
  console.log('onInstalled fired');
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.frameId === 0) {
    console.log('onHistoryStateUpdated fired');
    console.log(details);

    if (details.url.search(/https:\/\/www\.youtube\.com/) !== -1) {
      console.log('pattern matched');
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        function: redirectToCat,
      });
    }
  }
});

chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId === 0) {
    console.log('onCommitted fired');
    console.log(details);

    if (details.url.search(/https:\/\/www\.youtube\.com/) !== -1) {
      console.log('pattern matched');
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        function: redirectToCat,
      });
    }
  }
});

function redirectToCat() {
  location.replace('https://cataas.com/cat/gif');
}
