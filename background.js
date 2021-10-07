chrome.runtime.onInstalled.addListener(() => {
  console.log('onInstalled fired');
  chrome.storage.sync.set({
    rules: ['www.youtube.com', 'godfield.net'],
  });
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.frameId === 0) {
    console.log('onHistoryStateUpdated fired');
    console.log(details);

    manageNavigationEvent(details.url, details.tabId);
  }
});

chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId === 0) {
    console.log('onCommitted fired');
    console.log(details);

    manageNavigationEvent(details.url, details.tabId);
  }
});

function manageNavigationEvent(url, tabId) {
  chrome.storage.sync.get(['rules'], function (result) {
    for (const pattern of result.rules) {
      if (url.indexOf(pattern) !== -1) {
        console.log('pattern matched');
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          function: redirectToCat,
        });
      }
    }
  });
}

function redirectToCat() {
  location.replace('https://cataas.com/cat/gif');
}
