function initPegboard() {

  // template
  const templateGrid = document.querySelector('.template-grid');
  const templateGridSquares = templateGrid.querySelectorAll('.grid-square');

  // key colors
  const colorKeyGrid = document.querySelector('.color-key-grid');
  const allColorSquares = colorKeyGrid.querySelectorAll('.color-key-grid-square');
  const colorNames = ['white', 'red', 'blue', 'green', 'yellow'];

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


  // VIEWS

  // SYMBOLS
  const SYMBOLS = {
    TRIANGLE: '&#9651;',
    INVERTED_TRIANGLE: '&#x25BD;',
    SQUARE: '&#x25A1;',
    WHITE_CIRLCE: '&#x25CB;',
    BLACK_CIRCLE: '&#x25CF;',
  };

  // initialize key symbols
  Object.entries(SYMBOLS).forEach(([name, unicodeValue], index) => {

    const symbolKeyGridSquare = symbolKeyGridSquares[index];
    symbolKeyGridSquare.innerHTML = unicodeValue;

  });


  let activeColor = null;

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

  });


  // when a pegboard square is clicked, update w/ active color selection
  templateGrid.addEventListener('click', (e) => {

    if (!e.target.classList.contains('grid-square')) {
      return;
    }

    // TODO: add some indication that you need to select a color.
    if (activeColor === null) {
      return;
    }

    // remove any existing color. TODO: refactor by matching against 'color-${colorName}'
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


  });

}

initPegboard();
