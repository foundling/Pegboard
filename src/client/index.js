function initPegboard() {

  const templateGrid = document.querySelector('.template-grid');
  const templateGridSquares = templateGrid.querySelectorAll('.grid-square');
  const colorKeyGrid = document.querySelector('.color-key-grid');
  const symbolKeyGrid = document.querySelector('.symbol-key-grid');
  const symbolKeyGridSquares = symbolKeyGrid.querySelectorAll('.symbol-key-grid-square');
  const allColorSquares = colorKeyGrid.querySelectorAll('.color-key-grid-square');
  const colorNames = ['white', 'red', 'blue', 'green', 'yellow'];

  const SYMBOLS = {
    TRIANGLE: '&#9651;',
    INVERTED_TRIANGLE: '&#x25BD;',
    SQUARE: '&#x25A1;',
    WHITE_CIRLCE: '&#x25CB;',
    BLACK_CIRCLE: '&#x25CF;',
  };

  Object.entries(SYMBOLS).forEach(([name, unicodeValue], index) => {
    const symbolKeyGridSquare = symbolKeyGridSquares[index];
    symbolKeyGridSquare.innerHTML = unicodeValue;
    //symbolKeyGridSquares[index].
  });


  let activeColor = null;

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

  // click on a key grid square => 
  // deactivates any other activated squares
  // activates that square
  // sets click color to that square's color
  //const colorKeys = colorKeyGrid.querySelectorAll('.color-key-grid-square');

}

initPegboard();
