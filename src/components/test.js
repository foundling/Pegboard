class A {
  constructor() {
    this.x = 3;
  }

  method(x=this.x) {
    console.log(x);
  }
}

a = new A();
a.method()
