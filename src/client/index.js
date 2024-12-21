function initPegboard(data=null) {

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

  // menu, nav and views
  const menu = document.querySelector('.menu');
  const viewElements = document.querySelectorAll('.view');

  let currentView = 'create-pegboard'; 

  // navigate to an app view 
  menu.addEventListener('click', (e) => {

    if (!e.target.className.includes('nav-item')) {
      return;
    }

    const targetView = [...e.target.classList.values()]
      .find(v => v.startsWith('navigate-to'))
      ?.replace(/^navigate-to-/,'');

    console.log(targetView, viewElements);
    viewElements.forEach(el => {
      const isTarget = el.classList.contains(`view-${targetView}`); 
      el.classList.toggle('view-active', isTarget);
    });
    console.log(targetView, viewElements);

  });


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

  console.log(keyData);

  // initialize key symbols
  SYMBOLS.forEach((unicodeValue, index) => {

    const symbolKeyGridSquare = symbolKeyGridSquares[index];
    symbolKeyGridSquare.innerHTML = unicodeValue;

  });


  let activeColor = null;
  let activeSymbol = null;

  // when a color palette item is clicked, highlight and set to active color
  colorKeyGrid.addEventListener('click', (e) => {
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

  });


  // when a pegboard square is clicked, update w/ active color selection
  // and corresponding symbol
  templateGrid.addEventListener('click', (e) => {

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
    console.log(e.target);


  });

  if (data) {
    // initialize pegboard w/ 1-d array, one for each square.
    // data-symbol and data color
  }
}

initPegboard();
