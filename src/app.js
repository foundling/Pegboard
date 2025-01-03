import { Component } from './lib.js';
import * as components from './components/index.js';


const app = new Component({ 
  className: 'app',
  children: Object.values(components)
});

// todolist exercise

const todoList = new Component({
  className: 'todo-list',
  children: [
    'return library book',
    'vaccum',
    'have fun'
  ].map(todo => new Component({
    className: 'todo',
    data: {
      todo,
      complete: false,
    },
    events: {
      click: function(event, data, context) {
        console.log(event.currentTarget, data);
      },
      change: function(e, data, context) {
        console.log('change: ', e.target.checked);
      }
    },
    render: function(el, data, context) {
      globalThis.change = undefined;
      el.insertAdjacentHTML('beforeend', `
        <div>
          <input type="checkbox" onChange="change" name="todo-item"><span>${data.todo}</span>
        </div>
      `);
    }
  })),
});

const todo = new Component({
  className: 'todo',
  data: {
    value: 'return library book'
  },
  render: (el, data, context) => {
    el.innerHTML = `

    <pre>
      ${data.value};
    </pre>

    `;
  }
});

document.body.appendChild(todoList.el);

console.log(todoList);
