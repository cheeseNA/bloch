const lifeMax = 30;

function addItem(rule) {
  console.log('added rule: ');
  console.log(rule);
  const newLi = document.createElement('li');

  const textSpan = document.createElement('span');
  textSpan.textContent = rule.site;
  newLi.appendChild(textSpan);
  newLi.appendChild(document.createTextNode('  '));

  const select = createSelect(rule.life);
  select.addEventListener('change', updateChromeStorage);
  newLi.appendChild(select);
  newLi.appendChild(document.createTextNode('  '));

  const deleteLink = document.createElement('a');
  deleteLink.textContent = '[Delete]';
  deleteLink.href = '#';
  deleteLink.addEventListener('click', (event) => {
    document.getElementById('items').removeChild(newLi);
    updateChromeStorage();
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
    addItem({ site: site, life: parseInt(addSelect.value) });
    updateChromeStorage();
  } else {
    console.log('invalid domain');
  }
  addText.value = '';
}

function constructItems() {
  chrome.storage.sync.get(['rules'], function (result) {
    for (const rule of result.rules) {
      addItem(rule);
    }
  });
}

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

function updateChromeStorage() {
  const rules = [];
  const ruleLis = document.querySelectorAll('#items>li');
  for (const li of ruleLis) {
    rules.push({
      site: li.querySelector('span').textContent,
      life: parseInt(li.querySelector('select').value),
    });
  }
  console.log('rules: ');
  console.log(rules);
  chrome.storage.sync.set({ rules: rules });
}

document.addEventListener('DOMContentLoaded', function () {
  document
    .querySelector('#addButton')
    .addEventListener('click', addButtonListener);
  constructItems();

  const addDiv = document.querySelector('#addDiv');
  const addSelect = createSelect(0);
  addSelect.name = 'addSelect';
  addSelect.id = 'addSelect';
  addDiv.insertBefore(addSelect, document.getElementById('addButton'));
});
