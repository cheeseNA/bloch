chrome.runtime.onInstalled.addListener(() => {
  console.log('onInstalled fired');
  chrome.storage.sync.set({
    rules: [
      { site: 'www.youtube.com', life: 10, remain: 10, lastVisited: 0.0 },
      { site: 'godfield.net', life: 0, remain: 0, lastVisited: 0.0 },
    ],
  });

  const remainUpdateAlarm = new Date();
  remainUpdateAlarm.setHours(0, 0, 0, 0);
  remainUpdateAlarm.setDate(remainUpdateAlarm.getDate() + 1);
  console.log(remainUpdateAlarm);
  chrome.alarms.create('remainUpdateAlarm', {
    when: remainUpdateAlarm.getTime(),
    periodInMinutes: 2,
  });
});

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name == 'remainUpdateAlarm') {
    console.log('remainUpdateAlarm fired');
    chrome.storage.sync.get(['rules'], function (result) {
      for (const rule of result.rules) {
        rule.remain = rule.life;
      }
      chrome.storage.sync.set({ rules: result.rules });
    });
  }
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
    for (const rule of result.rules) {
      if (url.indexOf(rule.site) !== -1) {
        console.log('pattern matched');
        if (timeStamp > rule.lastVisited + 1000.0) {
          console.log('new visit');
          if (rule.remain <= 0) {
            console.log('redirect');
            rule.lastVisited = timeStamp;
            chrome.storage.sync.set({ rules: result.rules });
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              function: redirectToCat,
            });
          } else {
            rule.lastVisited = timeStamp;
            rule.remain -= 1;
            chrome.storage.sync.set({ rules: result.rules });
            console.log(`remain decreased to ${rule.remain}`);
          }
        } else {
          console.log('repeated access');
          rule.lastVisited = timeStamp;
          chrome.storage.sync.set({ rules: result.rules });
        }
      }
    }
  });
}

function redirectToCat() {
  location.replace('https://randomcatgifs.com/');
}
