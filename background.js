chrome.runtime.onInstalled.addListener(() => {
  console.log('onInstalled fired');
  chrome.storage.sync.set({
    rules: [
      { site: 'www.youtube.com', life: 10, remain: 10, lastVisited: 0.0 },
      { site: 'godfield.net', life: 0, remain: 0, lastVisited: 0.0 },
    ],
  });
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.frameId === 0) {
    console.log('onHistoryStateUpdated fired');
    console.log(details);

    manageNavigationEvent(details.url, details.tabId, details.timeStamp);
  }
});

chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId === 0) {
    console.log('onCommitted fired');
    console.log(details);

    manageNavigationEvent(details.url, details.tabId, details.timeStamp);
  }
});

function manageNavigationEvent(url, tabId, timeStamp) {
  chrome.storage.sync.get(['rules'], function (result) {
    for (const [index, rule] of result.rules.entries()) {
      if (url.indexOf(rule.site) !== -1) {
        console.log('pattern matched');
        if (timeStamp > rule.lastVisited + 1000.0) {
          console.log('new visit');
          if (rule.remain <= 0) {
            console.log('redirect');
            result.rules[index].lastVisited = timeStamp;
            chrome.storage.sync.set({ rules: result.rules });
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              function: redirectToCat,
            });
          } else {
            result.rules[index].lastVisited = timeStamp;
            result.rules[index].remain -= 1;
            chrome.storage.sync.set({ rules: result.rules });
            console.log(`remain decreased to ${result.rules[index].remain}`);
          }
        } else {
          console.log('repeated access');
          result.rules[index].lastVisited = timeStamp;
          chrome.storage.sync.set({ rules: result.rules });
        }
      }
    }
  });
}

function redirectToCat() {
  location.replace('https://randomcatgifs.com/');
}
