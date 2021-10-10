const lifeMax = 30;
let rules;

// add rule to items dom
function addItem(rule) {
  console.log('added rule: ');
  console.log(rule);
  const newLi = document.createElement('li');

  const textSpan = document.createElement('span');
  textSpan.textContent = rule.site;
  newLi.appendChild(textSpan);
  newLi.appendChild(document.createTextNode('  '));

  const select = createSelect(rule.life);
  select.addEventListener('change', (event) => {
    const liArray = Array.from(document.querySelectorAll('#items>li'));
    const index = liArray.indexOf(newLi);
    rules[index].life = parseInt(event.target.value);

    chrome.storage.sync.set({ rules: rules });
    console.log(`rule changed: ${JSON.stringify(rules)}`);
  });
  newLi.appendChild(select);
  newLi.appendChild(document.createTextNode('  '));

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
    const newRule = { site: site, life: parseInt(addSelect.value) };
    rules.push(newRule);
    addItem(newRule);

    chrome.storage.sync.set({ rules: rules });
  } else {
    console.log('invalid domain');
  }
  addText.value = '';
}

// create select (with options) dom
function createSelect(selectedValue) {
  const select = document.createElement('select');
  for (i = 0; i <= lifeMax; i++) {
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
  const addSelect = createSelect(0);
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
});
