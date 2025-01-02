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
      active: false,
    },
    events: {
      click: function(e, data, context) {
        const itemIndex = context.parent.children.findIndex(child => child.data === data)
        context.emit('key-item-change', { itemIndex, active: !data.active });
      }
    },
    render(el, data) {
      el.classList.toggle('active', data.active);
      this.removeChildren();
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
  },
  events: {
    'key-item-change': function (e, data, context) {
      const payload = e.detail.data;
      const { itemIndex, active } = payload;

      context.children.forEach((child, index) => {
        child.data.active = index === itemIndex;
        child.render();
      });
    }
  }
});

export { key };
