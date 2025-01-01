function zip(a,b) {

  const length = Math.min(a.length,b.length);
  const pairs = [];

  for (let i = 0; i < length; i++) { 

    const pair = [a[i],b[i]]; 
    pairs.push(pair);

  }

  return pairs;

}

class Grid {

  constructor(name, items, id) {
    this.name = name;
    this.id = id;
    this.items = items;
    this.el = null;
  }

  render() {

    const itemsHTML = this.items.map(item => item.render()).join('\n');
    const gridNode = document.createElement('div');

    return `
      <div class="grid">
      ${ itemsHTML }
      </div>
    `;

  }

  _init() {
    this.el = el;
    const el = document.querySelector('.grid');
  }

  export() {
    return {
      key: this.key.export(),
      items: this.items.map(item.export)
    }
  }

}

class GridItem {
  constructor({ color, symbol }) {
    this.color = color
    this.symbol = symbol
  }
  render() {
    return `
      <div class="grid-item">
        <div class="color-view ${this.color}"></div>
        <div class="symbol-view">${this.symbol}</div>
      </div>
    `;
  }
  export() {
    return {
      symbol: this.symbol,
      color: this.color
    }
  }
}

class Library {

  constructor() {

    this.library = [
      '&#9722;', '&#8679;',  '&#9672;', '&#9826;', '&#9873;',
      '&#9726;', '&#126;',   '&#35;',   '&#9711;', '&#61;',
      '&#33;',   '&#8258;',  '&#8251;', '&#8864;', '&#8896;',
      '&#9885;', '&#10047;', '&#8857;', '&#8709;', '&#9635;',
      '&#9547;', '&#9214;',  '&#8681;', '&#9680;', '&#9650;'
    ];

    this.items = this.library.map(symbol => new LibraryItem(symbol))
 
  }

  render() {
    return `
      <div class="library">
        ${this.items.map(item => item.render()).join('\n')}
      </div>
    `;
  }

  export() {
    return this.library.slice();
  }


}

class LibraryItem {

  constructor(symbol) {
    this.symbol = symbol;
  }

  render() {
    return `
      <div class="library-item">
        ${this.symbol}
      </div>
    `;
  }

}

class Key {

  constructor({ colorTable, library }) {

    const initialSymbolIndices = [0, 8, 16, 20, 22];

    this.library = library;
    this.colorTable = colorTable;
    this.items = zip(this.colorTable, initialSymbolIndices).map(([color, symbolIndex]) => {
      return new KeyItem({
        color,
        symbolIndex,
        library: this.library
      })
    });

  }

  render() {
    return `
      <div class="key">
        ${this.items.map(item => item.render()).join('\n')}
      </div>
    `;
  }

}

class KeyItem {

  constructor({ color, symbolIndex, library }) {

    this.symbolIndex = symbolIndex;
    this.color = color;
    this.library = library;

  }

  render() {

    return `
      <div class="key-item">
        <div class="key-color ${this.color}"></div>
        <div class="key-symbol">${this.library[this.symbolIndex]}</div>
      </div>
    `;

  }

}


class App {

  constructor({ grid, key, library }) {

    this.grid = grid;
    this.key = key;
    this.library = library;

  }

  render(el) {

    const appHTML = `
      <div class="app-container">
        ${this.library.render()}
        ${this.key.render()}
        ${this.grid.render()}
      </div>
    `

    el.insertAdjacentHTML('beforeend', appHTML);

  }

}

const gridItems = [...Array(100)].map(() => {
  return new GridItem({
    color: 'white',
    symbol: 'x'
  });
});

const library = new Library();
const colorTable = [ 'white', 'red', 'yellow', 'green', 'blue' ];
const key = new Key({ colorTable,  library: library.export() });
const grid = new Grid('test', gridItems);
const app = new App({ grid, key, library });

app.render(document.body);
