import Charactor from './charactor';

class Stage {
  constructor() {
    this.canvas = document.querySelector('.app');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext('2d');

    this.objects = [];

    this._start()
  }
  add(obj) {
    obj.start();
    this.objects.push(obj);
  }
  _start() {
    setInterval(this._update.bind(this), 1000 / 360);
    // setInterval(this._update.bind(this), 1000 / 180);
    // setInterval(this._update.bind(this), 1000 / 60);
    // setInterval(this._update.bind(this), 1000 / 20);
  }
  _update() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.objects.forEach(obj => {
      if (obj.update) {
        obj.search(this.canvas, this.objects);
        obj.update(this.canvas);
      }
      if (obj.render) {
        obj.render(this.canvas, this.ctx);
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  console.log('start app');

  const stage = new Stage();
  const max = 20;
  for (let i = 0; i < max; i++) {
    const padding = 50;
    stage.add(new Charactor({
      curiosity: Math.random() * 100,
      intelligence: Math.random() * 100,
      speed: Math.random() * 100,
      view: Math.random() * 360,
      vision: Math.random() * 100,

      x: padding + Math.random() * (stage.canvas.width - padding * 2),
      y: padding + Math.random() * (stage.canvas.height - padding * 2),
      dir: Math.random() * 360,
    }));
  }
});
