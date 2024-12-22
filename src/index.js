function initPegboard() {

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

  // pegboard mode: either 'color-mode' or 'symbol-mode'
  // initialied in html w/ 'color-mode'
  const pegboardModeSelector = document.querySelector('.mode-selector');

  function changePegboardMode(e) {
    if (!e.target.name === 'pegboard-mode-selector') {
      return;
    }
    // css handles showing/hiding bg color in symbol mode
    // and showing/hiding symbols in color mode.
    templateGrid.classList.toggle('color-mode');
    templateGrid.classList.toggle('symbol-mode');
  }

  // menu, nav and views
  const menu = document.querySelector('.menu');
  const viewElements = document.querySelectorAll('.view');

  let currentView = 'create-pegboard'; 

  function saveToLocalStorage(payload) {
    localStorage.setItem('pegboard', payload);
  }

  function save() {

    // persist a sparse map of grid state.
    const data = [...templateGridSquares].reduce((o, el, index) => {

      const color = el.dataset.color;
      const symbol = el.dataset.symbol;

      if (color && symbol) {
        o[index] = { color, symbol };
      }

      return o;

    }, {});

    if (Object.values(data).length > 0) {
      saveToLocalStorage(JSON.stringify(data));
    }
  }


  // navigate to an app view 
  function changeView(e) {

    if (!e.target.className.includes('nav-item')) {
      return;
    }

    const targetView = [...e.target.classList.values()]
      .find(v => v.startsWith('navigate-to'))
      ?.replace(/^navigate-to-/,'');

    viewElements.forEach(el => {
      const isTarget = el.classList.contains(`view-${targetView}`); 
      el.classList.toggle('view-active', isTarget);
    });

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


  let activeColor = null;
  let activeSymbol = null;

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

  function loadFromLocalStorage() {

    const pegboardData = localStorage.getItem('pegboard');
    return pegboardData ? JSON.parse(pegboardData) : null;

  }

  function load() {

    const gridData = loadFromLocalStorage();

    if (!gridData) {
      return;
    }

    templateGridSquares.forEach((el, index) => {

      const oldColor = el.dataset.color;
      const squareData = gridData[index];

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


  colorKeyGrid.addEventListener('click', selectColorAndSymbol);
  templateGrid.addEventListener('click', updatePegboardSquare)
  // TODO: views
  // menu.addEventListener('click', changeView);
  saveButton.addEventListener('click', save);
  loadButton.addEventListener('click', load);
  pegboardModeSelector.addEventListener('change', changePegboardMode); 

  load();
}

initPegboard();
