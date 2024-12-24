(function Pegboard() {

  // config values
  const APP_STORAGE_KEY = 'pegboard';
  const DEFAULT_PEGBOARD_ID =  1;

 // app state
  let activeColor = null;
  let activeSymbol = null;
  let currentPegboard = null;
  let viewMode = 'color'; // color | symbol

  const pegboardAppContainer = document.querySelector('.pegboard-app');
  // template
  const templateGrid = document.querySelector('.template-grid');
  const templateGridSquares = templateGrid.querySelectorAll('.grid-square');

  // key colors
  const colorKeyGrid = document.querySelector('.color-key-grid');
  const allColorSquares = colorKeyGrid.querySelectorAll('.color-key-grid-square');
  const colorNames = [
    'white',
    'red',
    'yellow',
    'green',
    'blue',
  ];

  // key symbols
  const symbolKeyGrid = document.querySelector('.symbol-key-grid');
  const symbolKeyGridSquares = symbolKeyGrid.querySelectorAll('.symbol-key-grid-square');
  const loadButton = document.getElementById('load-button');

  // pegboard controls
  const pegboardSelect = document.getElementById('pegboard-select')
  const pegboardSelectDefaultOption = document.getElementById('pegboard-select-default')
  const pegboardNameInput = document.getElementById('pegboard-name-input');
  const newPegboardButton = document.getElementById('new-pegboard');
  const printButton = document.getElementById('print-button');
  const exportButton = document.getElementById('export-button');
  const importButton = document.getElementById('import-button');
  const fileInput = document.getElementById('file-input');


  // data import / export 
  async function importFile(e) {

    fileInput.click()

    const file = fileInput.files[0];

    if (!file) return;

    const json = await file.text();
    const importedData = JSON.parse(json);
    const { result, msg } = validatePegboardData(importedData) 

    if (!validatePegboardData(importedData)) {
      throw new Error('invalid import data!');
    }
    importPegboardData(importedData);
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

    return { result: true } ;

  }

  function openFileInput(e) {
    fileInput.click();
  }

  function triggerDownload(e) {
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


  function openPrintWindow() {

    window.open(`?print=true&mode=${viewMode}`);

  }

  // SYMBOLS
  const SYMBOLS = [
    '&#9651;',
    '&#x25BD;',
    '&#x25A1;',
    '&#x25CB;',
    '&#x25CF;',
  ];

  const keyData = colorNames.reduce((memo, colorName, index) => {

    if (!memo['colorToSymbol']) {
      memo['colorToSymbol'] = {};
    }
    memo['colorToSymbol'][colorName] = SYMBOLS[index];
    if (!memo['symbolToColor']) {
      memo['symbolToColor'] = {};
    }
    memo['symbolToColor'][SYMBOLS[index]] = colorName;

    return memo;

  }, {});

  // initialize key symbols
  SYMBOLS.forEach((unicodeValue, index) => {

    const symbolKeyGridSquare = symbolKeyGridSquares[index];
    symbolKeyGridSquare.innerHTML = unicodeValue;

  });

  // pegboard mode: either 'color-mode' or 'symbol-mode'
  // initialied in html w/ 'color-mode'
  const viewModeSelector = document.querySelector('.view-mode-selector');

  // menu, nav and views
  const menu = document.querySelector('.menu');
 
  /*
   * Storage Functions
   */

  function PegboardRecord({ id=1, name='new pegboard', squares=[] }) {
    return {
      id,
      name,
      squares,
      timestamp: new Date() / 1000
    };
  }

  function initStorage() {

    const record = PegboardRecord({
      id: DEFAULT_PEGBOARD_ID,
      name: 'new pegboard',
      squares: {},
      timestamp: new Date() / 1000
    })

    return savePegboard(record);

  }

  function loadAppFromLocalStorage() {

    const payload = localStorage.getItem(APP_STORAGE_KEY);
    const appData = JSON.parse(payload);

    return appData;

  }
  
  function importPegboardData(data) {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(data[APP_STORAGE_KEY]));
    initApp();
  }

  function loadPegboard(pegboardId) {

    const appData = loadAppFromLocalStorage();
    const newPegboard = appData[pegboardId]; 

    return newPegboard;

  }

  function loadAllPegboards() {
    return loadAppFromLocalStorage();
  }

  function save() {

    // persist a sparse map of grid state.
    const squares = [...templateGridSquares].reduce((o, el, index) => {

      const color = el.dataset.color;
      const symbol = el.dataset.symbol;

      if (color && symbol) {
        o[index] = { color, symbol };
      }

      return o;

    }, {});

    const record = PegboardRecord({
      id: currentPegboard.id,
      name: currentPegboard.name,
      squares,
      timestamp: new Date() / 1000
    });

    savePegboard(record);
  }

  function savePegboard(record) {

    const currentAppData = loadAppFromLocalStorage();
    let newAppData;

    // nothing saved for this app yet,
    // create entire app data structure
    if (!currentAppData) {
      newAppData = {
        [record.id]: record
      }
    } else {
      // previously stored data. we have all data under 'pegboard'
      // update it.
      newAppData = currentAppData;
      newAppData[record.id] = record;
    }

    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(newAppData));

    return JSON.parse(localStorage.getItem(APP_STORAGE_KEY));

  }


  function initPegboardSquares(record) {

    templateGridSquares.forEach((el, index) => {

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
   */

  // update pegboard input name
  function changePegboardName(e) {

    currentPegboard.name = e.target.value;
    save();
    const allPegboards = loadAllPegboards();
    initPegboardSelect(allPegboards, currentPegboard);

  }

  // print mode
  function setPrintMode(inPrintMode) {

    if (!inPrintMode) {
      return;
    }

    pegboardAppContainer.classList.toggle('print-view', inPrintMode);

  }

  // toggle color / symbol view mode.

  function onViewModeChange(e) {

    if (!e.target.name === 'pegboard-mode-selector') {
      return;
    }

    setViewMode(e.target.value);

  }

  function setViewMode(newViewMode) {

    viewMode = newViewMode;
    templateGrid.classList.toggle('color-mode', newViewMode === 'color');
    templateGrid.classList.toggle('symbol-mode', newViewMode === 'symbol');

    viewModeSelector.querySelectorAll('input').forEach(el => {
      el.checked = el.value === newViewMode;
    });


  }


  // View-specific functions
  function populatePegboardList(ids) {
    const listMarkup = ids.map(id => `
      <li>${id}</li>
    `);

    while (pegboardList.hasChildNodes()) {
      pegboardList.removeChild(pegboardList.lastChild);
    }
    pegboardList.insertAdjacentHTML('beforeend', listMarkup);
  }

  // when a color palette item is clicked, highlight and set to active color
  function selectColorAndSymbol(e) {

    if (!e.target.classList.contains('color-key-grid-square')) {
      return;
    }

    const colorId = e.target.id;
    const colorSquare = document.querySelector(`.color-key-grid-square#${colorId}`)

    // deactivate old color
    if (activeColor) {
      document.getElementById(`${activeColor}`).classList.toggle('active');
    }

    activeColor = colorId;

    // activate new color
    colorSquare.classList.add('active');
    activeSymbol = keyData.colorToSymbol[colorId];

  }


  // when a pegboard square is clicked, update w/ active color selection
  // and corresponding symbol
  function updatePegboardSquare(e) {

    if (!e.target.classList.contains('grid-square')) {
      return;
    }

    // TODO: add some UI indication that you need to select a color.
    if (activeColor === null) {
      return;
    }


    // untoggle square
    if (e.target.dataset.color === activeColor && e.target.dataset.symbol === activeSymbol) {

      delete e.target.dataset.color;
      delete e.target.dataset.symbol;
      e.target.innerHTML = '';

    } else {
      // set square 
      e.target.dataset.color = activeColor;
      e.target.dataset.symbol = activeSymbol;
      e.target.innerHTML = activeSymbol;
    }

    save();
  }



  function switchPegboardById(e) {

    const pegboardId = e.target.value;
    currentPegboard = loadPegboard(pegboardId)

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

  function createNewPegboard() {

    const pegboards = loadAllPegboards();
    const sortedKeys = Object.keys(pegboards).map(k => parseInt(k)).sort()
    const latestRecord = sortedKeys.slice(-1)[0];

    const newPegboard = PegboardRecord({
      id: latestRecord + 1
    });
    const appData = savePegboard(newPegboard);

    currentPegboard = appData[newPegboard.id];

    initPegboardSelect(appData, currentPegboard);
    pegboardNameInput.value = currentPegboard.name;
    initPegboardSquares(currentPegboard);

  }


  /*
   * bind events 
   *
   */

  colorKeyGrid.addEventListener('click', selectColorAndSymbol);
  templateGrid.addEventListener('click', updatePegboardSquare)
  pegboardNameInput.addEventListener('change', changePegboardName);
  pegboardSelect.addEventListener('change', switchPegboardById);
  viewModeSelector.addEventListener('change', onViewModeChange); 
  newPegboardButton.addEventListener('click', createNewPegboard);
  printButton.addEventListener('click', openPrintWindow);
  exportButton.addEventListener('click', triggerDownload);
  importButton.addEventListener('click', openFileInput);
  fileInput.addEventListener('change', importFile);

  function findLastTouched(appData) {

    const records = Object.values(appData);
    if (records.length === 1) {
      return records[0];
    } else {
      return records.sort((e1, e2) => e2.timestamp - e1.timestamp)[0]
    }

  }

  // app initialization
  function initApp() {

    const appData = loadAppFromLocalStorage() || initStorage();

    const searchParams = new URLSearchParams(document.location.search);
    const inPrintMode = searchParams.has('print');
    viewMode = searchParams.get('mode') || 'color';


    currentPegboard = findLastTouched(appData);
    pegboardNameInput.value = currentPegboard.name;

    initPegboardSquares(currentPegboard);
    initPegboardSelect(appData, currentPegboard);

    setPrintMode(inPrintMode);
    setViewMode(viewMode);

  }

  initApp();
})();
