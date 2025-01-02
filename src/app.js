import { Component } from './lib.js';
import { library, grid, key } from './components/index.js';

const app = new Component({ 
  className: 'app',
  children: [ grid, key, library ]
});

document.body.appendChild(app.el);
