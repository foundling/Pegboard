function zip(a,b) {

  const length = Math.min(a.length,b.length);
  const pairs = [];

  for (let i = 0; i < length; i++) { 

    const pair = [a[i],b[i]]; 
    pairs.push(pair);

  }

  return pairs;

}

class BaseNode {

  constructor({ className, children, events, data }) {

    this.data = data || {};
    this.children = children;
    this.events = events || {};

    this.el = document.createElement('div');
    this.el.classList.add(className);

  }

  bindEvents() {

    const eventNames = Object.keys(this.events); 

    eventNames.forEach(name => {
      this.el.addEventListener(name, this.events[name]);
    });

  }

  render() {

    this.removeChildren();

    this.children.forEach(child => {
      this.el.appendChild(child.el);
    });

  }

  removeChildren() {

    while (this.el.lastChild) {
      this.el.removeChild(this.el.lastChild);
    }

  }

}

class Grid extends BaseNode {

  constructor({ children, events, data }) {

    super({ className: 'grid', data, events, children });

    this.render();
    this.bindEvents();

  }

}

class Library extends BaseNode {

  constructor({ children, events, data }) {

    super({ className: 'library', children, events, data });

    this.render();
    this.bindEvents();

  }

}

class LibraryItem extends BaseNode {

  constructor({ children, events, data }) {

    super({ className: 'library-item', children, events, data })

    this.render();
    this.bindEvents();

  }

  render() {
    this.el.insertAdjacentHTML('beforeend', `
      <div>${this.data.symbol}</div>
    `);
  }

}

class KeyItem extends BaseNode {

  constructor({ events, data }) {

    super({ className: 'key-item', events, data });

    this.render();
    this.bindEvents();

  }

  render() {

    this.el.insertAdjacentHTML('beforeend', `
      <div class="key-color ${this.data.color}"></div>
      <div class="key-symbol">${this.data.library[this.data.symbolIndex]}</div>
    `);

  }

}


class GridItem extends BaseNode {

  constructor({ color, symbol, events, data }) {

    super({ className: 'grid-item', events, data })

    this.render();
    this.bindEvents();

  }

  render() {

    this.removeChildren();

    this.el.insertAdjacentHTML('beforeend', `
      <div class="color-view ${this.data.color}"></div>
      <div class="symbol-view">${this.data.symbol}</div>
    `);

  }

}

class Key extends BaseNode {

  constructor({ children, events, data }) {

    super({ className: 'key', children, events, data });

    this.render();
    this.bindEvents();

  }

}

class App extends BaseNode {

  constructor({ children, events, data }) {

    super({ className: 'app', events, children, data });

    this.render();
    this.bindEvents();

  }

}

const colorTable = [ 'white', 'red', 'yellow', 'green', 'blue' ];
const symbolTable = [
  '&#9722;', '&#8679;',  '&#9672;', '&#9826;', '&#9873;',
  '&#9726;', '&#126;',   '&#35;',   '&#9711;', '&#61;',
  '&#33;',   '&#8258;',  '&#8251;', '&#8864;', '&#8896;',
  '&#9885;', '&#10047;', '&#8857;', '&#8709;', '&#9635;',
  '&#9547;', '&#9214;',  '&#8681;', '&#9680;', '&#9650;'
];

const gridItems = [...Array(100)].map(() => {
  return new GridItem({
    data: {
      color: 'white',
      symbol: 'x',
    },
    events: {
      click: (e) => {
        console.log('grid item');
      }
    }
  });
});

const libraryItems = symbolTable.map((symbol) => new LibraryItem({
  data: { 
    symbol
  },
  events: {
    click: e => console.log('library item')
  },
  children: [symbol]
}));

const library = new Library({
  children: libraryItems,
  events: {
    click: e => {
      console.log('library')
    }
  }
});


const keyItems = zip(colorTable,[0, 8, 16, 20, 22]).map(([color, symbolIndex]) => (new KeyItem({
    data: {
      color,
      symbolIndex,
      library: symbolTable.slice(),
    },
    events: {
      click: e => {
        console.log('key item');
      }
    },
  }))
);

const key = new Key({ 

  children: keyItems,
  data: {
    colorTable,
  }

});

const grid = new Grid({
  children: gridItems,
  events: {
    click: e => { console.log('grid') } 
  }
});

const app = new App({ 

  children: [
    grid,
    key,
    library
  ],
  events: {
    mouseup: function(e) {
      console.log('mouse up');
    }
  }

});

document.body.appendChild(app.el);
