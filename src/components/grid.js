import { Component } from '/src/lib.js'; 

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

const grid = new Component({
  className: 'grid',
  children: gridItems
});

export { grid };
