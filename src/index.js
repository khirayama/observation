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
    this.objects.push(obj);
  }
  _start() {
    setInterval(this._update.bind(this), 1000 / 180);
    // setInterval(this._update.bind(this), 1000 / 60);
    // setInterval(this._update.bind(this), 1000 / 20);
  }
  _update() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.objects.forEach(obj => {
      if (obj.update) {
        obj.update(this.canvas, this.ctx);
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
  stage.add(new Charactor({
    x: stage.canvas.width / 2,
    y: stage.canvas.height / 2,
  }));
});
