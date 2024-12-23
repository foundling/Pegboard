(function Pegboard() {

  // config values
  const APP_STORAGE_KEY = 'pegboard';
  const DEFAULT_PEGBOARD_ID =  1;

 // app state
  let currentView = 'create-pegboard'; 
  let activeColor = null;
  let activeSymbol = null;
  let currentPegboard = null;

  // template
  const templateGrid = document.querySelector('.template-grid');
  const templateGridSquares = templateGrid.querySelectorAll('.grid-square');

  // key colors
  const colorKeyGrid = document.querySelector('.color-key-grid');
  const allColorSquares = colorKeyGrid.querySelectorAll('.color-key-grid-square');
  const colorNames = [
    'white',
    'red',
    'blue',
    'green',
    'yellow'
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
  const pegboardModeSelector = document.querySelector('.mode-selector');

  // menu, nav and views
  const menu = document.querySelector('.menu');
 
  /*
   * Storage Functions
   */

  function PegboardRecord({ id=1, name='new pegboard', squares=[] }) {
    return {
      id,
      name,
      squares
    };
  }

  function initStorage() {

    const record = PegboardRecord({
      id: DEFAULT_PEGBOARD_ID,
      name: 'new pegboard',
      squares: {}
    })

    return savePegboard(record);

  }

  function loadAppFromLocalStorage() {

    const payload = localStorage.getItem(APP_STORAGE_KEY);
    const appData = JSON.parse(payload);

    return appData;

  }

  function loadPegboard(pegboardId) {

    const appData = loadAppFromLocalStorage();

    return appData[pegboardId];

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
      squares
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

  // toggle color / symbol view mode.
  function changePegboardMode(e) {
    if (!e.target.name === 'pegboard-mode-selector') {
      return;
    }
    // css handles showing/hiding bg color in symbol mode
    // and showing/hiding symbols in color mode.
    templateGrid.classList.toggle('color-mode');
    templateGrid.classList.toggle('symbol-mode');
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

    const newPegboard = PegboardRecord({ id: latestRecord + 1 });
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
  pegboardModeSelector.addEventListener('change', changePegboardMode); 
  newPegboardButton.addEventListener('click', createNewPegboard);

  // app initialization
  function initApp() {

    const appData = loadAppFromLocalStorage() || initStorage();

    currentPegboard = appData[DEFAULT_PEGBOARD_ID];
    pegboardNameInput.value = currentPegboard.name;

    initPegboardSquares(currentPegboard);
    initPegboardSelect(appData, currentPegboard);

  }

  initApp();
})();
