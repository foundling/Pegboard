class Component {

  constructor({ className, children, events, data, render, parent }) {

    this.name = className;
    this.parent = parent;
    this.data = data || {};
    this.children = children;
    this.events = events || {};

    this.el = document.createElement('div');
    this.el.classList.add(className);

    if (render) {
      const wrapper = () => {
        const r = render.bind(this);
        return r(this.el, this.data);
      }
      this.render = wrapper;
    }

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

  emit(name, data) {
    const e = new CustomEvent(name, { bubbles: true, detail: { data } });
    this.el.dispatchEvent(e);
  }

  render(el=this.el, data=this.data) {

    this.removeChildren();

    this.children.forEach(child => {
      child.parent = this;
      this.el.appendChild(child.el);
    });

  }

  removeChildren() {

    while (this.el.lastChild) {
      this.el.removeChild(this.el.lastChild);
    }

  }

}

export { Component };
