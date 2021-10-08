function addItem(name) {
  const newLi = document.createElement('li');
  const textSpan = document.createElement('span');
  textSpan.textContent = name;
  newLi.appendChild(textSpan);
  newLi.appendChild(document.createTextNode('  '));
  const deleteLink = document.createElement('a');
  deleteLink.textContent = '[Delete]';
  deleteLink.href = '#';
  deleteLink.addEventListener('click', deleteItem);
  newLi.appendChild(deleteLink);

  document.getElementById('items').appendChild(newLi);

  function deleteItem() {
    document.getElementById('items').removeChild(newLi);
    updateChromeStorage();
  }
}

function addButtonListener() {
  const input = document.getElementById('newItem');
  const text = input.value;
  const domainPattern = /[0-9a-zA-Z\-:]+\.[0-9a-zA-Z\-:]+/;
  if (domainPattern.test(text)) {
    addItem(text);
    updateChromeStorage();
  } else {
    console.log('invalid domain');
  }
  input.value = '';
}

function constructItems() {
  chrome.storage.sync.get(['rules'], function (result) {
    for (const pattern of result.rules) {
      addItem(pattern);
    }
  });
}

function updateChromeStorage() {
  const items = Array.from(document.querySelectorAll('#items>li>span'));
  console.log(items);
  const patterns = [];
  for (const span of items) {
    patterns.push(span.textContent);
  }
  console.log(patterns);
  chrome.storage.sync.set({ rules: patterns });
}

document.addEventListener('DOMContentLoaded', function () {
  document
    .querySelector('#addButton')
    .addEventListener('click', addButtonListener);
  constructItems();
});
