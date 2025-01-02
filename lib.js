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

export { Component }
