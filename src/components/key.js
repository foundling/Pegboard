import { Component } from '/src/lib.js';
import { zip } from '/src/utils.js';
import { colorTable, symbolTable } from '/src/data.js';

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

export { key };
