(function Pegboard() {

  // static config values
  const APP_STORAGE_KEY = 'pegboard';
  const DEFAULT_PEGBOARD_ID =  1;

  const colorTable = [
    'white', 'red', 'yellow', 'green', 'blue'
  ];

  const symbolTable = [
     '&#9722;', '&#8679;',  '&#9672;', '&#9826;', '&#9873;',
     '&#9726;', '&#126;',   '&#35;',   '&#9711;', '&#61;',
     '&#33;',   '&#8258;',  '&#8251;', '&#8864;', '&#8896;',
     '&#9885;', '&#10047;', '&#8857;', '&#8709;', '&#9635;',
     '&#9547;', '&#9214;',  '&#8681;', '&#9680;', '&#9650;'
  ];

  // Pegboard and Key UI
  const pegboardAppContainer = document.querySelector('.pegboard-app');
  const pegboardContainer = document.querySelector('.pegboard-container');
  const pegboard = document.querySelector('.pegboard');
  const pegboardSquares = pegboard.querySelectorAll('.pegboard-square');
  const pegboardKey = document.querySelector('.key');
  const keySymbolSquares = pegboardKey.querySelectorAll('.key-symbol-square');
  const keyColorSquares = pegboardKey.querySelectorAll('.key-color-square');
  const symbolLibrary = document.getElementById('symbol-library');
  const symbolLibrarySymbols = symbolLibrary.getElementsByClassName('symbol');


  // Menu + Pegboard Controls  UI
  const loadButton = document.getElementById('load-button');
  const pegboardSelect = document.getElementById('pegboard-select')
  const pegboardNameInput = document.getElementById('pegboard-name-input');
  const resetAppDataButton = document.getElementById('reset-database');
  const newPegboardButton = document.getElementById('new-pegboard');
  const clearPegboardButton = document.getElementById('clear-pegboard');
  const copyPegboardButton = document.getElementById('copy-pegboard');
  const saveButton = document.getElementById('save-button');
  const exportButton = document.getElementById('download-link');
  const importButton = document.getElementById('import-button');
  const fileInput = document.getElementById('file-input');
  const viewModeSelector = document.querySelector('.view-mode-selector');


  // app state
  let activeColorIndex = null;
  let activeKeySymbolIndex = null;
  let activeSymbolLibraryIndex = null;
  let currentPegboard = null;
  let viewMode = 'color'; // color | symbol
  let mouseDown = false;

  function buildKeyMap(symbols, colors) {

    const keyMap = {
      s: {},
      c: {}
    };

    // NOTE: arbitrary indices 
    const defaultSymbolLibraryIndices = [4,9,14,19, 24];

    for (let i = 0; i < colors.length; ++i) {

      const symbolLibraryIndex = defaultSymbolLibraryIndices[i];

      keyMap.s[symbolLibraryIndex] = i;
      keyMap.c[i] = symbolLibraryIndex;

    }

    return keyMap;

  }

  /*
   *
   * app initialization
   *
   */
  function initApp() {


    const appData = loadAppFromLocalStorage() || initStorage();
    currentPegboard = findLastTouched(appData);
    pegboardNameInput.value = currentPegboard.name;

    drawPegboard(currentPegboard);
    initPegboardSelect(appData, currentPegboard);
    initSymbolLibrary(symbolLibrary, symbolTable, colorTable, currentPegboard.keyMap);
    initKeyColors(keyColorSquares, currentPegboard.keyMap, colorTable);
    initKeySymbols(keySymbolSquares, currentPegboard.keyMap, symbolTable, colorTable);

    setActiveKeyColor(0);

    setViewMode(viewMode);

  }


  /*
   * pegboard selection ui logic
   *
   */

  function onMouseDown(e) {

    const isPegboardSquare = e.target.classList.contains('pegboard-square');

    if (!isPegboardSquare) {
      return;
    }

    mouseDown = true;

    const element = e.target;
    const colorIndex = activeColorIndex;
    const symbolIndex = currentPegboard.keyMap.c[activeColorIndex];

    const squareIndex = [...pegboardSquares].indexOf(e.target);

    if (element.dataset.colorIndex == colorIndex &&
        element.dataset.symbolIndex == symbolIndex) {

      // toggle previously selected square off
      delete element.dataset.colorIndex;
      delete element.dataset.color;
      delete element.dataset.symbolIndex;
      element.innerHTML = '';

      // unset this square's data in model
      delete currentPegboard.squares[squareIndex];

    } else {

      // set new square
      element.dataset.colorIndex = colorIndex;
      element.dataset.color = colorTable[colorIndex];
      element.dataset.symbolIndex = symbolIndex;
      element.innerHTML = symbolTable[symbolIndex];

      currentPegboard.squares[squareIndex] = {
        colorIndex,
        symbolIndex
      };

    }


  }

  function onMouseOver(e) {

    const isPegboardSquare = e.target.classList.contains('pegboard-square');

    if (isPegboardSquare && mouseDown) {

      const element = e.target;
      const colorIndex = activeColorIndex;
      const symbolIndex = currentPegboard.keyMap.c[activeColorIndex];
      const squareIndex = [...pegboardSquares].indexOf(e.target);

      // toggle previously selected square off
      if (element.dataset.colorIndex == colorIndex &&
          element.dataset.symbolIndex == symbolIndex) {

        delete element.dataset.colorIndex;
        delete element.dataset.color;
        delete element.dataset.symbolIndex;
        element.innerHTML = '';

        // unset this square's data in model
        delete currentPegboard.squares[squareIndex];

      } else {
        // set new square
        element.dataset.colorIndex = colorIndex;
        element.dataset.color = colorTable[colorIndex];
        element.dataset.symbolIndex = symbolIndex;
        element.innerHTML = symbolTable[symbolIndex];

        currentPegboard.squares[squareIndex] = {
          colorIndex,
          symbolIndex
        };

      }

    }

  }


  function onMouseUp(e) {

    if (mouseDown) {

      savePegboard(currentPegboard);
      mouseDown = false;

    }

  }

  /*
   * data import / export
   */
  async function onFileSelect(e) {

    fileInput.click()

    const file = fileInput.files[0];

    if (!file) return;

    const json = await file.text();
    const importedData = JSON.parse(json);
    const { result, msg } = validatePegboardData(importedData)

    if (!validatePegboardData(importedData)) {
      throw new Error('invalid import data!');
    }

    importPegboardDatabase(importedData);

  }

  function onExport(e) {
    const exportData = {
      [APP_STORAGE_KEY]: loadAppFromLocalStorage()
    };
    const blob = new Blob(
      [JSON.stringify(exportData, null, 2)],
      { content: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    e.target.href=url;
  }

  function onImport(e) {
    fileInput.click();
  }

  function validatePegboardData(data) {

    const hasAppKey = APP_STORAGE_KEY in data;
    const hasPegboardIndexKeys = Object.keys(data[APP_STORAGE_KEY])
      .map(k => parseInt(k))
      .every(n => !Number.isNaN(n));

    const hasProperRecords = Object.values(data[APP_STORAGE_KEY]).every(record => {
      return 'id' in record
          && 'name' in record
          && 'timestamp' in record
          && 'squares' in record;
    });

    if (!hasAppKey) return { result: false, msg: 'no app key' }
    if (!hasPegboardIndexKeys) return { result: false, msg: 'bad index keys' }
    if (!hasProperRecords) return { result: false, msg:  'bad records' }

    return { result: true };

  }

  function onSave() {
    createPdf(currentPegboard.name);
  }

  function createPdf(name) {

    const colorClone = pegboardContainer.cloneNode(true);

    colorClone.classList.remove('symbol-mode');
    colorClone.classList.add('color-mode');
    colorClone.classList.add('html2pdf__page-break');

    const symbolClone = pegboardContainer.cloneNode(true);

    symbolClone.classList.remove('color-mode');
    symbolClone.classList.add('symbol-mode');
    symbolClone.classList.add('html2pdf__page-break');

    const container = document.createElement('div');
    container.classList.add('print-container');
    container.appendChild(colorClone);
    container.appendChild(symbolClone);

    const pdf = html2pdf(container, {
      filename: `${name}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 4 },
      pagebreak: {
        mode: 'legacy'
      }
    });

  }


  /*
   * Storage Functions
   */

  function PegboardRecord({
    id=1,
    name='new pegboard',
    squares={},
    timestamp=Date.now(),
    keyMap=buildKeyMap(symbolTable, colorTable)
  }) {

    return {
      id,
      name,
      squares,
      keyMap
    };

  }

  function findLastTouched(appData) {

    const records = Object.values(appData);
    if (records.length === 1) {
      return records[0];
    } else {
      return records.sort((e1, e2) => e2.timestamp - e1.timestamp)[0]
    }

  }

  function resetAppData() {

    localStorage.removeItem('pegboard');

    initApp();

  }

  function initStorage() {

    const record = PegboardRecord({
      id: DEFAULT_PEGBOARD_ID,
      name: 'new pegboard',
      squares: {},
    })

    return savePegboard(record);

  }

  function loadAppFromLocalStorage() {

    const payload = localStorage.getItem(APP_STORAGE_KEY);
    const appData = JSON.parse(payload);

    return appData;

  }

  function importPegboardDatabase(data) {

    localStorage.setItem(
      APP_STORAGE_KEY,
      JSON.stringify(data[APP_STORAGE_KEY])
    );

    initApp();

  }

  function loadPegboardById(pegboardId) {

    const appData = loadAppFromLocalStorage();
    const newPegboard = appData[pegboardId];

    return newPegboard;

  }

  function loadAllPegboards() {
    return loadAppFromLocalStorage();
  }

  function savePegboard(pegboardRecord) {
    console.log('save');

    pegboardRecord.timestamp = Date.now();
    const currentAppData = loadAppFromLocalStorage();
    let newAppData;

    // nothing saved for this app yet,
    // create entire app data structure
    if (!currentAppData) {
      newAppData = {
        [pegboardRecord.id]: pegboardRecord
      }
    } else {
      // previously stored data. we have all data under 'pegboard'
      // update it.
      newAppData = currentAppData;
      newAppData[pegboardRecord.id] = pegboardRecord;
    }

    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(newAppData));

    return JSON.parse(localStorage.getItem(APP_STORAGE_KEY));

  }

  /*
   *
   * App Render Functions
   *
   */

  function initKeyColors(keyColorSquares, keyMap, colorTable) {

    colorTable.forEach((color, index) => {
      keyColorSquares[index].classList.add(colorTable[index]);
    });

  }

  function initKeySymbols(keySymbolSquares, keyMap, symbolTable, colorTable) {

    keySymbolSquares.forEach((square, index) => {
      const keyItemNumber = /symbol-(.*)/.exec(square.id)?.[1]; // same as color index
      const symbolIndex = keyMap.c[keyItemNumber];
      square.dataset.symbolIndex = symbolIndex;
      square.innerHTML = symbolTable[symbolIndex];
    });

  }

  function initSymbolLibrary(parentEl, symbolTable, colorTable, keyMap) {

    const symbolGridMarkup = symbolTable.map((symbol, index) => {

      const active = index in keyMap.s;

      return `
        <li
          class="symbol ${active ? 'selected' : ''}"
          data-symbol="${symbol}"
          data-symbol-index="${index}"
        >${symbol}</li>
      `;

    }).join('');

    removeChildren(parentEl);
    parentEl.insertAdjacentHTML('beforeend', symbolGridMarkup);

  }

  // set squares based on record
  function drawPegboard(record) {

    const keyMap = record.keyMap;
    const squares = [...pegboardSquares];

    squares.forEach((el, index) => {

      //const oldColorIndex = el.dataset.colorIndex;
      const squareData = record.squares[index];
      // reminder .squares is not an array, it's an obj with index-looking keys.

      // for each grid element, populate with saved data
      // or re-init square.
      if (squareData) {

        const { symbolIndex, colorIndex } = squareData;

        el.dataset.symbolIndex = symbolIndex;
        el.dataset.colorIndex = colorIndex;
        el.dataset.color = colorTable[colorIndex];
        el.innerHTML = symbolIndex == null ? '' : symbolTable[symbolIndex];

      } else {
        el.dataset.symbolIndex = '';
        el.dataset.colorIndex = '';
        el.dataset.color = '';
        el.innerHTML = '';
      }
    });

  }


  function onViewModeChange(e) {

    if (!e.target.name === 'pegboard-mode-selector') {
      return;
    }

    setViewMode(e.target.value);

  }

  function setViewMode(mode) {

    viewMode = mode;

    pegboardContainer.classList.toggle('color-mode', mode === 'color');
    pegboardContainer.classList.toggle('symbol-mode', mode === 'symbol');

    viewModeSelector.querySelectorAll('input').forEach(el => {
      el.checked = el.value === mode;
    });


  }


  function populatePegboardList(ids) {
    const listMarkup = ids.map(id => `
      <li>${id}</li>
    `);

    removeChildren(pegboardList);
    pegboardList.insertAdjacentHTML('beforeend', listMarkup);
  }

  function onSymbolLibraryClick(e) {

    const symbolSquare = e.target;

    if (!symbolSquare.classList.contains('symbol')) {
      return;
    }

    // ignore clicks on active symbol library square
    if (symbolSquare.classList.contains('selected')) {
      return;
    }


    const symbolSquares = [...symbolLibrarySymbols];
    const newActiveSymbolLibraryIndex = symbolSquares.indexOf(symbolSquare);
    const oldActiveSymbolLibraryIndex = activeSymbolLibraryIndex;

    // remove existing active/selected item
    symbolSquares[oldActiveSymbolLibraryIndex].classList.remove('selected');
    symbolSquares[oldActiveSymbolLibraryIndex].classList.remove('active');

    // light up new active/selected.
    symbolSquares[newActiveSymbolLibraryIndex].classList.add('selected');
    symbolSquares[newActiveSymbolLibraryIndex].classList.add('active');

    // update keymap bidirectional color-symbol connection
    delete currentPegboard.keyMap.s[oldActiveSymbolLibraryIndex];
    currentPegboard.keyMap.c[activeKeySymbolIndex] = newActiveSymbolLibraryIndex;
    currentPegboard.keyMap.s[newActiveSymbolLibraryIndex] = activeKeySymbolIndex;

    Object.keys(currentPegboard.squares).forEach(squareIndexKey => {
      if (!currentPegboard.squares[squareIndexKey]) {
        return;
      }
      // BUG: only reset symbolIndex if matches what square had.
      // find only the squares where previous symbolLibraryIndex matches what we have for this square
      // and update it to the new index.
      if (oldActiveSymbolLibraryIndex == currentPegboard.squares[squareIndexKey].symbolIndex) {
        currentPegboard.squares[squareIndexKey].symbolIndex = newActiveSymbolLibraryIndex;
      }

    });
    savePegboard(currentPegboard);

    // rerender keymap ui dependents
    initKeyColors(keyColorSquares, currentPegboard.keyMap, colorTable);
    initKeySymbols(keySymbolSquares, currentPegboard.keyMap, symbolTable, colorTable);

    // redraw pegboard
    drawPegboard(currentPegboard);

    // update active symbol library index
    activeSymbolLibraryIndex = newActiveSymbolLibraryIndex;

  }

  function onKeyClick(e) {

    // ux: when we click on a color, activate associated symbol square in the key
    // and in the symbol library.
    //
    // deactivate any other color/symbol pairs.

    if (!e.target.classList.contains('key-color-square')) {
      return;
    }

    const keyItemIndex = /color-(.*)/.exec(e.target.id)?.[1];

    // update ui w/ new selection
    setActiveKeyColor(keyItemIndex);

  }

  // when a color palette item is clicked, highlight associated symbol
  // and set to active color in key and symbol library
  function setActiveKeyColor(colorIndex) {

    const colorSquare = document.getElementById(`color-${colorIndex}`);
    const keySymbolEl = document.getElementById(`symbol-${colorIndex}`);
    const indexInSymbolLibrary = keySymbolEl.dataset.symbolIndex;

    // deactivate old symbol
    if (activeKeySymbolIndex != null) {
      const prevKeySymbolEl = document.getElementById(`symbol-${activeKeySymbolIndex}`);
      prevKeySymbolEl.classList.remove('active');
      symbolLibrary.children[prevKeySymbolEl.dataset.symbolIndex].classList.remove('active');
    } 

    // activate new symbol
    keySymbolEl.classList.add('active');
    symbolLibrary.children[keySymbolEl.dataset.symbolIndex].classList.add('active');

    // deactivate old color
    if (activeColorIndex != null) {
      document.getElementById(`color-${activeColorIndex}`).classList.remove('active');
    }


    // activate new color
    colorSquare.classList.add('active');

    // update global state
    activeColorIndex = colorIndex;
    activeKeySymbolIndex = colorIndex;
    activeSymbolLibraryIndex = indexInSymbolLibrary;
  }

  function onPegboardNameChange(e) {
    changePegboardName(currentPegboard, e.target.value);
  }

  function changePegboardName(currentPegboard, newName) {

    currentPegboard.name = newName;
    savePegboard(currentPegboard);

    const allPegboards = loadAllPegboards();

    initPegboardSelect(allPegboards, currentPegboard);

  }


  function onPegboardSelectChange(e) {

    switchPegboard(e.target.value);

  }


  function switchPegboard(pegboardId) {

    currentPegboard = loadPegboardById(pegboardId)
    drawPegboard(currentPegboard);
    pegboardNameInput.value = currentPegboard.name;

  }

  function initPegboardSelect(pegboards, currentPegboard) {

    const options = Object.entries(pegboards).map(([id, pegboard]) => {

      const selected = pegboard.name === currentPegboard.name;
      return `<option ${ selected ? 'selected' : '' } value="${id}">${pegboard.name}</option>`;

    }).join('');

    removeChildren(pegboardSelect)
    pegboardSelect.insertAdjacentHTML('beforeend', options);

  }

  function copyPegboard() {

    const pegboards = loadAllPegboards();
    const sortedKeys = Object.keys(pegboards).map(k => parseInt(k)).sort()
    const latestRecord = sortedKeys.slice(-1)[0];

    const newPegboardRecord = PegboardRecord({
      id: latestRecord + 1,
      name: `${currentPegboard.name} copy`,
      squares: currentPegboard.squares
    });

    savePegboard(newPegboardRecord);

    initApp();
  }

  function clearPegboard() {

    // save pegboard with empty squares obj
    currentPegboard.squares = {};
    savePegboard(currentPegboard);

    initApp();

  }

  function createNewPegboard() {

    const pegboards = loadAllPegboards();
    const sortedKeys = Object.keys(pegboards).map(k => parseInt(k)).sort()
    const latestRecord = sortedKeys.slice(-1)[0];

    const newPegboardRecord = PegboardRecord({
      id: latestRecord + 1,
      name: 'new pegboard'
    });
    const appData = savePegboard(newPegboardRecord);

    currentPegboard = appData[newPegboardRecord.id];

    initPegboardSelect(appData, currentPegboard);
    pegboardNameInput.value = currentPegboard.name;
    drawPegboard(currentPegboard);

  }

  /*
   * utils
   *
   */

  function removeChildren(node) {
    while (node.lastChild) {
      node.removeChild(node.lastChild);
    }
  }

  /*
   * bind events
   *
   */

  pegboardKey.addEventListener('click', onKeyClick);
  symbolLibrary.addEventListener('click', onSymbolLibraryClick);
  pegboardNameInput.addEventListener('change', onPegboardNameChange);
  pegboardSelect.addEventListener('change', onPegboardSelectChange);
  viewModeSelector.addEventListener('change', onViewModeChange);
  saveButton.addEventListener('click', onSave);
  exportButton.addEventListener('click', onExport);
  importButton.addEventListener('click', onImport);
  fileInput.addEventListener('change', onFileSelect);
  pegboard.addEventListener('mousedown', onMouseDown);
  document.body.addEventListener('mouseover', onMouseOver);
  document.body.addEventListener('mouseup', onMouseUp);

  newPegboardButton.addEventListener('click', createNewPegboard);
  clearPegboardButton.addEventListener('click', clearPegboard);
  resetAppDataButton.addEventListener('click', resetAppData);
  copyPegboardButton.addEventListener('click', copyPegboard);


  initApp();

})();
