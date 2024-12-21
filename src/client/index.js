let savedData = null;

function initPegboard(pegboardData=null) {

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
  const saveButton = document.querySelector('.navigate-to-save');
  const loadButton = document.querySelector('.navigate-to-load');

  // menu, nav and views
  const menu = document.querySelector('.menu');
  const viewElements = document.querySelectorAll('.view');

  let currentView = 'create-pegboard'; 

  function save() {
    const data = [...templateGridSquares].map((el, index, arr) => {
      const squareData = {
        color: [...el.classList].find(className => className.startsWith('color-'))?.replace('color-',''),
        // TODO: color: el.dataset.color,
        symbol: el.dataset.symbol,
      };
      return squareData;
    });
    const serializedData = JSON.stringify(data, null, 2);
    savedData = serializedData;
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
    activeColor = null;
    allColorSquares.forEach(square => {
      square.classList.remove('active');
    });
    const colorId = e.target.id;
    const colorSquare = document.querySelector(`.color-key-grid-square#${colorId}`)
    colorSquare.classList.add('active');
    activeColor = colorId;
    activeSymbol = keyData.colorToSymbol[colorId];

  }


  // when a pegboard square is clicked, update w/ active color selection
  // and corresponding symbol
  function updatePegboardSquare(e) {

    if (!e.target.classList.contains('grid-square')) {
      return;
    }

    // TODO: add some indication that you need to select a color.
    if (activeColor === null) {
      return;
    }

    // remove any existing color/symbol combo.
    // TODO: refactor by matching against 'color-${colorName}'
    for (let i = 0; i < colorNames.length; ++i) {
      const colorName = colorNames[i];
      const colorClassName = `color-${colorName}`;

      if (colorName !== activeColor && e.target.classList.contains(colorClassName)) {
        e.target.classList.remove(colorClassName);
      }
    }

    // set new color
    const activeColorClass = `color-${activeColor}`;
    e.target.classList.toggle(activeColorClass);
    e.target.innerHTML = keyData.colorToSymbol[activeColor];

    if (e.target.dataset.symbol === activeSymbol) {
      delete e.target.dataset.symbol;
      e.target.innerHTML = '';
    } else {
      e.target.dataset.symbol = keyData.colorToSymbol[activeColor]; 
    }
  }


  function loadData(serializedData) {
    if (!serializedData) {
      return;
    }


    const gridData = JSON.parse(serializedData);

    templateGridSquares.forEach((el, index) => {

      const { symbol, color } = gridData[index];

      if (!(symbol && color)) {
        return;
      }

      el.dataset.symbol = symbol;
      el.innerHTML = symbol;
      el.classList.add(`color-${color}`);

    });

  }


  colorKeyGrid.addEventListener('click', selectColorAndSymbol);
  templateGrid.addEventListener('click', updatePegboardSquare)
  //menu.addEventListener('click', changeView);
  saveButton.addEventListener('click', save);
  loadButton.addEventListener('click', () => loadData(savedData));

  if (pegboardData) {

    loadData(pegboardData);
    
    // initialize pegboard w/ 1-d array, one for each square.
    // data-symbol and data color
  }
}

initPegboard(savedData);
