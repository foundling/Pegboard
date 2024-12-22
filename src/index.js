function Pegboard(pegboardName=null) {

  // config values
  const APP_STORAGE_KEY = 'pegboard';
  const DEFAULT_PEGBOARD_ID =  'default'

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
  const saveButton = document.querySelector('#save-button');
  const loadButton = document.querySelector('#load-button');


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
  const viewElements = document.querySelectorAll('.view');

  // pegboard name
  const pegboardNameInput = document.querySelector('#pegboard-name-input');

  // app state
  let currentView = 'create-pegboard'; 
  let activeColor = null;
  let activeSymbol = null;
  let currentPegboardId = DEFAULT_PEGBOARD_ID; 


  /*
   * Storage Functions
   */

  function initStorage() {
    return saveToLocalStorage(DEFAULT_PEGBOARD_ID, {});
  }

  function loadFromLocalStorage(pegboardId=null) {

    const pegboardData = localStorage.getItem(APP_STORAGE_KEY);

    if (pegboardId) {
      return JSON.parse(pegboardData)?.[pegboardId];
    } else {
      return pegboardData;
    }

  }

  function loadAllPegboards() {
    const pegboards = loadFromLocalStorage();
  }


  function save() {

    const pegboardId = currentPegboardId;

    if (!pegboardId) {
      // TODO: add error UI.
      return;
      throw new Error('error saving pegboard: no current pegboard id');
    }

    // persist a sparse map of grid state.
    const data = [...templateGridSquares].reduce((o, el, index) => {

      const color = el.dataset.color;
      const symbol = el.dataset.symbol;

      if (color && symbol) {
        o[index] = { color, symbol };
      }

      return o;

    }, {});

    saveToLocalStorage(pegboardId, data);
  }

  function saveToLocalStorage(id, payload) {

    const currentAppData = loadFromLocalStorage();
    let newAppData;

    // nothing saved for this app yet,
    // create entire app data structure
    if (!currentAppData) {
      newAppData = {
        [id]: payload
      }
    } else {
      // previously stored data. we have all data under 'pegboard'
      // update it.
      newAppData = {
        ...currentAppData[currentPegboardId],
        [id]: payload
      };
    }
    console.log({newAppData})
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(newAppData));
    return JSON.parse(localStorage.getItem(APP_STORAGE_KEY));

  }


  function loadPegboard(pegboardId) {

    const squareConfigs = loadFromLocalStorage(pegboardId);

    if (!squareConfigs) {
      return;
    }

    templateGridSquares.forEach((el, index) => {

      const oldColor = el.dataset.color;
      const squareData = squareConfigs[index];

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



  // navigate to an app view 
  function changeView(e) {

    const targetView = e.target.dataset.nav; 

    viewElements.forEach(el => {
      const isTarget = el.classList.contains(`view-${targetView}`); 
      el.classList.toggle('view-active', isTarget);
    });

    if (targetView === 'list') {
      const pegboards = loadAllPegboards();
      populateList(pegboards);

    }

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
      document.querySelector(`#${activeColor}`).classList.toggle('active');
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

  }


  /*
   *
   *
   * bind events 
   *
   *
   */

  colorKeyGrid.addEventListener('click', selectColorAndSymbol);
  templateGrid.addEventListener('click', updatePegboardSquare)
  menu.addEventListener('click', changeView);
  saveButton.addEventListener('click', save);
  //loadButton.addEventListener('click', load);
  pegboardModeSelector.addEventListener('change', changePegboardMode); 

  function initApp() {
    // app not loaded before, initialize w/ default pegboard
    if (!loadFromLocalStorage(DEFAULT_PEGBOARD_ID)) {
      initStorage();

    } else {
      //app has been initialized, so load the default pegboard. 
      loadPegboard(DEFAULT_PEGBOARD_ID);
    }
    currentPegboardId = DEFAULT_PEGBOARD_ID;
    pegboardNameInput.value = currentPegboardId;
  }

  initApp();
}

Pegboard();
