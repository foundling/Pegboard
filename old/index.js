function zip(a,b) {

  const length = Math.min(a.length, b.length);
  const pairs = [];

  for (let i = 0; i < length; i++) { 

    const pair = [a[i],b[i]]; 
    pairs.push(pair);

  }

  return pairs;

}

class Component {

  constructor({ className, children, events, data, render }) {

    this.data = data || {};
    this.children = children;
    this.events = events || {};

    if (render) {
      this.render = render;
    }

    this.el = document.createElement('div');
    this.el.classList.add(className);

    this.render(this.el, data);
    this.bindEvents();

  }

  bindEvents() {

    const eventNames = Object.keys(this.events); 

    eventNames.forEach(name => {

      const originalFunction = this.events[name];

      const wrappedHandler = (e) => {
        return originalFunction(e, this.data, this);
      }

      this.el.addEventListener(name, wrappedHandler);

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

const colorTable = [ 'white', 'red', 'yellow', 'green', 'blue' ];
const symbolTable = [
  '&#9722;', '&#8679;',  '&#9672;', '&#9826;', '&#9873;',
  '&#9726;', '&#126;',   '&#35;',   '&#9711;', '&#61;',
  '&#33;',   '&#8258;',  '&#8251;', '&#8864;', '&#8896;',
  '&#9885;', '&#10047;', '&#8857;', '&#8709;', '&#9635;',
  '&#9547;', '&#9214;',  '&#8681;', '&#9680;', '&#9650;'
];

const gridItems = [...Array(100)].map(() => {

  return new Component({
    className: 'grid-item',
    data: {
      color: 'red',
      symbol: 'x',
      viewMode: 'color',
      active: false,
    },
    events: {
      click: (e, data, thisVal) => {
        data.active = !data.active;
        thisVal.render(thisVal.el, data);
      }
    },
    render(el, data) {

      el.dataset.viewMode = data.viewMode;
      el.dataset.color = data.color;

      el.classList.toggle('active', data.active);
      this.removeChildren();

      if (data.active) {
        el.insertAdjacentHTML('beforeend', `${data.symbol}`);
      } 

    }
  });

});

const libraryItems = symbolTable.map((symbol) => new Component({
  className: 'library-item',
  data: { 
    symbol
  },
  events: {
    click: e => console.log('library item')
  },
  children: [symbol],
  render: function(el, data) {

    el.insertAdjacentHTML('beforeend', `
      <div>${data.symbol}</div>
    `);

  }
}));

const library = new Component({
  className: 'library',
  children: libraryItems
});


const colorSymbolPairs = zip(colorTable,[0, 8, 16, 20, 22]);
const keyItems = colorSymbolPairs.map(([color, symbolIndex]) => new Component({
    className: 'key-item',
    data: {
      color,
      symbolIndex,
      library: symbolTable.slice(),
    },
    render(el, data) {

      el.insertAdjacentHTML('beforeend', `
        <div class="key-color ${data.color}"></div>
        <div class="key-symbol">${data.library[data.symbolIndex]}</div>
      `);

    }
  })
);

const key = new Component({ 
  className: 'key',
  children: keyItems,
  data: {
    colorTable,
  }
});

const grid = new Component({
  className: 'grid',
  children: gridItems
});

const app = new Component({ 
  className: 'app',
  children: [ grid, key, library ]
});

document.body.appendChild(app.el);
