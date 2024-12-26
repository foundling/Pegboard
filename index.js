(function Pegboard() {

  // static config values
  const APP_STORAGE_KEY = 'pegboard';
  const DEFAULT_PEGBOARD_ID =  1;

  const colorNames = [
      'white',
      'red',
      'yellow',
      'green',
      'blue',
    ];

  const symbols = [
     '&#9722;',
     '&#8679;',
     '&#9672;',
     '&#9826;',
     '&#9873;',
     '&#9726;',
     '&#126;',
     '&#35;',
     '&#9711;',
     '&#61;',
     '&#33;',
     '&#8258;',
     '&#8251;',
     '&#8864;',
     '&#8896;',
     '&#9885;',
     '&#10047;',
     '&#8857;',
     '&#8709;',
     '&#9635;',
     '&#9547;',
     '&#9214;',
     '&#8681;',
     '&#9680;',
     '&#9650;'
  ];

  const keyData = colorNames.reduce((memo, colorName, index) => {

    if (!memo['colorToSymbol']) {
      memo['colorToSymbol'] = {};
    }
    memo['colorToSymbol'][colorName] = symbols[index];
    if (!memo['symbolToColor']) {
      memo['symbolToColor'] = {};
    }
    memo['symbolToColor'][symbols[index]] = colorName;

    return memo;

  }, {});

  // app state
  let activeColor = null;
  let activeSymbol = null;
  let currentPegboard = null;
  let viewMode = 'color'; // color | symbol
  let mouseDown = false;

  // Pegboard and Key UI
  const pegboardAppContainer = document.querySelector('.pegboard-app');
  const pegboardContainer = document.querySelector('.pegboard-container');
  const pegboard = document.querySelector('.pegboard');
  const pegboardSquares = pegboard.querySelectorAll('.pegboard-square');
  const colorKey = document.querySelector('.color-key');
  const symbolKey = document.querySelector('.symbol-key');
  const symbolKeySquares = symbolKey.querySelectorAll('.symbol-key-square');
  const symbolList = document.getElementById('symbol-list');


  // Menu + Pegboard Controls  UI 
  const loadButton = document.getElementById('load-button');
  const pegboardSelect = document.getElementById('pegboard-select')
  const pegboardNameInput = document.getElementById('pegboard-name-input');
  const newPegboardButton = document.getElementById('new-pegboard');
  const clearPegboardButton = document.getElementById('clear-pegboard');
  const copyPegboardButton = document.getElementById('copy-pegboard');
  const saveButton = document.getElementById('save-button');
  const exportButton = document.getElementById('download-link');
  const importButton = document.getElementById('import-button');
  const fileInput = document.getElementById('file-input');
  const viewModeSelector = document.querySelector('.view-mode-selector');



  /*
   *
   * app initialization
   *
   */
  function initApp() {

    const appData = loadAppFromLocalStorage() || initStorage();


    // initialize key symbols
    symbols.slice(0,5).forEach((unicodeValue, index) => {

      const symbolKeySquare = symbolKeySquares[index];
      symbolKeySquare.innerHTML = unicodeValue;

    });

    currentPegboard = findLastTouched(appData);
    pegboardNameInput.value = currentPegboard.name;

    initPegboardSquares(currentPegboard);
    initPegboardSelect(appData, currentPegboard);
    initSymbolList(symbolList, symbols);

    setActiveColor('red');
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
    togglePegboardSquare(e.target, activeColor, activeSymbol);
  }


  function onMouseOver(e) {

    const isPegboardSquare = e.target.classList.contains('pegboard-square');

    if (!(isPegboardSquare && mouseDown)) {
      return;
    }

    togglePegboardSquare(e.target, activeColor, activeSymbol);

  }


  function onMouseUp(e) {

    mouseDown = false;

    // persist a sparse map of grid state.
    const squares = getSquareDataFromPegboard(pegboardSquares);
    currentPegboard.squares = squares;

    savePegboard(currentPegboard);

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

  function onImport(e) {
    fileInput.click();
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

  function PegboardRecord({ id=1, name='new pegboard', squares={}, timestamp=Date.now() }) {
    return {
      id,
      name,
      squares
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

  function getSquareDataFromPegboard(pegboardSquareElements) {

    // storage record's .squares is a sparse map of the pegboard state.
    return [...pegboardSquareElements].reduce((o, el, index) => {

      const color = el.dataset.color;
      const symbol = el.dataset.symbol;

      if (color && symbol) {
        o[index] = { color, symbol };
      }

      return o;

    }, {});

  }

  function savePegboard(pegboardRecord) {

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


  function initSymbolList(symbolList, symbols) {

    const symbolGridMarkup = symbols.map(symbol => `
      <li>${symbol}</li>
    `).join('');
    symbolList.insertAdjacentHTML('beforeend', symbolGridMarkup);
  }

  function initPegboardSquares(record) {

    pegboardSquares.forEach((el, index) => {

      const oldColor = el.dataset.color;
      const squareData = record.squares[index]; 
      // reminder .squares is not an array, it's an obj with index-looking keys.

      // for each grid element, populate with saved data
      // or re-init square.
      if (squareData) {

        const { symbol, color } = squareData;

        el.dataset.symbol = symbol;
        el.dataset.color = color;
        el.innerHTML = symbol;

      } else {

        el.dataset.symbol = '';
        el.innerHTML = '';
        el.dataset.color = '';

      }

    });

  }


  /*
   * UI Functions
   * TODO: put on[FuncName] handlers here.
   */
  // toggle color / symbol view mode.

  function onViewModeChange(e) {

    if (!e.target.name === 'pegboard-mode-selector') {
      return;
    }

    setViewMode(e.target.value);

  }

  function setViewMode(newViewMode) {

    viewMode = newViewMode;
    pegboardContainer.classList.toggle('color-mode', newViewMode === 'color');
    pegboardContainer.classList.toggle('symbol-mode', newViewMode === 'symbol');

    viewModeSelector.querySelectorAll('input').forEach(el => {
      el.checked = el.value === newViewMode;
    });


  }


  function populatePegboardList(ids) {
    const listMarkup = ids.map(id => `
      <li>${id}</li>
    `);

    while (pegboardList.hasChildNodes()) {
      pegboardList.removeChild(pegboardList.lastChild);
    }
    pegboardList.insertAdjacentHTML('beforeend', listMarkup);
  }

  function onKeyClick(e) {

    if (!e.target.classList.contains('color-key-square')) {
      return;
    }

    const colorId = e.target.id;

    setActiveColor(colorId);

  }

  // when a color palette item is clicked, highlight and set to active color
  function setActiveColor(color) {

    // TODO: can u just look by id?
    const colorSquare = document.querySelector(`.color-key-square#${color}`)

    // deactivate old color
    if (activeColor) {
      document.getElementById(`${activeColor}`).classList.toggle('active');
    }

    activeColor = color;

    // activate new color
    colorSquare.classList.add('active');
    activeSymbol = keyData.colorToSymbol[color];

  }

  function togglePegboardSquare(element, activeColor, activeSymbol) {

    // untoggle square
    if (element.dataset.color === activeColor && element.dataset.symbol === activeSymbol) {

      delete element.dataset.color;
      delete element.dataset.symbol;
      element.innerHTML = '';

    } else {
      // set square 
      element.dataset.color = activeColor;
      element.dataset.symbol = activeSymbol;
      element.innerHTML = activeSymbol;
    }

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
    initPegboardSquares(currentPegboard);
    pegboardNameInput.value = currentPegboard.name;

  }

  function initPegboardSelect(pegboards, currentPegboard) {

    const options = Object.entries(pegboards).map(([id, pegboard]) => {
      const selected = pegboard.name === currentPegboard.name;
      return `<option ${ selected ? 'selected' : '' } value="${id}">${pegboard.name}</option>`;
    }).join('');

    while (pegboardSelect.lastChild) {
      pegboardSelect.removeChild(pegboardSelect.lastChild);
    }

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
    initPegboardSquares(currentPegboard);

  }

  /*
   * bind events 
   *
   */

  colorKey.addEventListener('click', onKeyClick);
  pegboardNameInput.addEventListener('change', onPegboardNameChange);
  pegboardSelect.addEventListener('change', onPegboardSelectChange);
  viewModeSelector.addEventListener('change', onViewModeChange); 
  saveButton.addEventListener('click', onSave);
  exportButton.addEventListener('click', onExport);
  importButton.addEventListener('click', onImport);
  fileInput.addEventListener('change', onFileSelect);
  pegboard.addEventListener('mousedown', onMouseDown);
  pegboard.addEventListener('mouseup', onMouseUp);
  pegboard.addEventListener('mouseover', onMouseOver);

  newPegboardButton.addEventListener('click', createNewPegboard);
  clearPegboardButton.addEventListener('click', clearPegboard);
  copyPegboardButton.addEventListener('click', copyPegboard);

  initApp();

})();
