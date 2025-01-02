import { Component } from '/src/lib.js';
import { zip } from '/src/utils.js';
import { colorTable, symbolTable } from '/src/data.js';

const libraryItems = symbolTable.map((symbol) => new Component({
  className: 'library-item',
  data: { 
    symbol
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

export { library };
