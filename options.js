const lifeMax = 30;
let rules;
let timing;

// add rule to items dom
function addItem(rule) {
  console.log('added rule: ');
  console.log(rule);
  const newLi = document.createElement('li');

  const textSpan = document.createElement('span');
  textSpan.textContent = rule.site;
  newLi.appendChild(textSpan);
  newLi.appendChild(document.createTextNode('\u00a0\u00a0'));

  const select = createSelect(lifeMax, rule.life);
  select.classList.add('lifeSelect');
  select.addEventListener('change', (event) => {
    const liArray = Array.from(document.querySelectorAll('#items>li'));
    const index = liArray.indexOf(newLi);
    const newLife = parseInt(event.target.value);
    rules[index].life = newLife;
    if (rules[index].remain > newLife) {
      const remainSelect = document
        .querySelectorAll('#items>li')
        [index].querySelector('.remainSelect');
      remainSelect.value = newLife;
      rules[index].remain = newLife;
    }
    chrome.storage.sync.set({ rules: rules });
    console.log(`rule changed: ${JSON.stringify(rules)}`);
  });
  newLi.appendChild(select);
  newLi.appendChild(document.createTextNode('\u00a0\u00a0'));

  const remainSelect = createSelect(lifeMax, rule.remain);
  remainSelect.classList.add('remainSelect');
  remainSelect.setAttribute('disabled', 'disabled');
  newLi.appendChild(remainSelect);
  newLi.appendChild(document.createTextNode('\u00a0\u00a0'));

  const deleteLink = document.createElement('a');
  deleteLink.textContent = '[Delete]';
  deleteLink.href = '#';
  deleteLink.addEventListener('click', (event) => {
    // update rules and dom
    const liArray = Array.from(document.querySelectorAll('#items>li'));
    const index = liArray.indexOf(newLi);
    rules.splice(index, 1);
    document.getElementById('items').removeChild(newLi);

    chrome.storage.sync.set({ rules: rules });
    console.log(`rule deleted: ${JSON.stringify(rules)}`);
  });
  newLi.appendChild(deleteLink);

  document.getElementById('items').appendChild(newLi);
}

function addButtonListener() {
  const addText = document.getElementById('addText');
  const addSelect = document.getElementById('addSelect');
  const site = addText.value;
  const domainPattern = /[0-9a-zA-Z\-:]+\.[0-9a-zA-Z\-:]+/;
  if (domainPattern.test(site)) {
    const life = parseInt(addSelect.value);
    const newRule = { site: site, life: life, remain: life, lastVisited: 0.0 };
    rules.push(newRule);
    addItem(newRule);

    chrome.storage.sync.set({ rules: rules });
  } else {
    console.log('invalid domain');
  }
  addText.value = '';
}

// create select (with options) dom
function createSelect(maxIndex, selectedValue) {
  const select = document.createElement('select');
  for (i = 0; i <= maxIndex; i++) {
    const op = document.createElement('option');
    op.value = i;
    op.text = i;
    if (i === selectedValue) {
      op.setAttribute('selected', 'selected');
    }
    select.appendChild(op);
  }
  return select;
}

document.addEventListener('DOMContentLoaded', function () {
  // construct add form
  document
    .querySelector('#addButton')
    .addEventListener('click', addButtonListener);
  const addDiv = document.querySelector('#addDiv');
  const addSelect = createSelect(lifeMax, 0);
  addSelect.name = 'addSelect';
  addSelect.id = 'addSelect';
  addDiv.insertBefore(addSelect, document.getElementById('addButton'));

  // construct rules
  chrome.storage.sync.get(['rules'], function (result) {
    rules = result.rules;
    for (const rule of result.rules) {
      addItem(rule);
    }
  });

  // construct timing form
  chrome.storage.sync.get(['timing'], function (result) {
    timing = result.timing;
    const timingDiv = document.querySelector('#timing');
    const hour = result.timing.hour;
    const minute = result.timing.minute;
    const hourSelect = createSelect(23, hour);
    const minuteSelect = createSelect(59, minute);
    function updateAlarm(hour, minute) {
      const remainUpdateAlarm = new Date();
      remainUpdateAlarm.setHours(hour, minute, 0, 0);
      remainUpdateAlarm.setDate(remainUpdateAlarm.getDate() + 1);
      console.log(remainUpdateAlarm);
      chrome.alarms.create('remainUpdateAlarm', {
        when: remainUpdateAlarm.getTime(),
        periodInMinutes: 60 * 24,
      });
    }
    hourSelect.addEventListener('change', (event) => {
      timing.hour = parseInt(event.target.value);
      chrome.storage.sync.set({ timing: timing });
      updateAlarm(timing.hour, timing.minute);
      console.log(`timing changed: ${JSON.stringify(timing)}`);
    });
    minuteSelect.addEventListener('change', (event) => {
      timing.minute = parseInt(event.target.value);
      chrome.storage.sync.set({ timing: timing });
      updateAlarm(timing.hour, timing.minute);
      console.log(`timing changed: ${JSON.stringify(timing)}`);
    });
    timingDiv.appendChild(document.createTextNode('hour:\u00a0\u00a0'));
    timingDiv.appendChild(hourSelect);
    timingDiv.appendChild(
      document.createTextNode('\u00a0\u00a0minute:\u00a0\u00a0')
    );
    timingDiv.appendChild(minuteSelect);
  });
});
