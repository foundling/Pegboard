const templateGrid = document.querySelector('.template-grid');
const templateGridSquares = templateGrid.querySelectorAll('.grid-square');
const colorKeyGrid = document.querySelector('.color-key-grid');
const allColorSquares = colorKeyGrid.querySelectorAll('.color-key-grid-square');
const colorNames = ['white', 'red', 'blue', 'green', 'yellow'];

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

  console.log('active color: ', activeColor);

});

templateGrid.addEventListener('click', (e) => {
  console.log(e.target);

  if (!e.target.classList.contains('grid-square')) {
    return;
  }

  if (activeColor === null) {
    return;
  }

  for (let i = 0; i < colorNames.length; ++i) {
    const colorName = colorNames[i];

    if (colorName !== activeColor && e.target.classList.contains(colorName)) {
      e.target.classList.remove(colorName);
    }
  }

  e.target.classList.toggle(activeColor);


});

// click on a key grid square => 
// deactivates any other activated squares
// activates that square
// sets click color to that square's color
const colorKeys = colorKeyGrid.querySelectorAll('.color-key-grid-square');
console.log(colorKeys);
