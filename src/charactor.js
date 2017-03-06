const actions = {
  STOP: '__STOP',
  MOVE: '__MOVE',
  RUN: '__RUN',
  ATTACK: '__ATTACK',
  PROTECT: '__PROTECT',
};

export default class Charactor {
  constructor({curiosity, fitness, stamina, speed, attack, defense, view, vision, x = 0, y = 0} = {}) {
    this.action = actions.STOP;
    this.count = {
      stop: 0,
      move: 0,
      run: 0,
      attack: 0,
      protect: 0,
    };
    this.status = {
      curiosity: curiosity || 50,
      fitness: fitness || 50,
      stamina: stamina || 50,
      speed: speed || 50,
      attack: attack || 50,
      defense: defense || 50,
      view: view || 180, // max 360(deg)
      vision: vision || 50,
    };
    this.state = {};
    this.pos = {
      x,
      y,
      dir: 45, // (deg)
    };

    this.start();
  }
  getStatus() {
    return this.status;
  }
  getState() {
    return this.state;
  }
  start() {
    this.state = Object.assign({}, this.status);
  }
  update(canvas, ctx) {
    this._count();
    this._switchAction();

    let mag = 0;
    switch (this.action) {
      case actions.STOP: {
        mag = 0;
        break;
      }
      case actions.MOVE: {
        mag = 0.2;
        break;
      }
      case actions.RUN: {
        mag = 1;
        break;
      }
    }
    const vx = this.status.speed * Math.cos(this._deg2rad(this.pos.dir)) * mag / 20;
    const vy = this.status.speed * Math.sin(this._deg2rad(this.pos.dir)) * mag / 20;
    this.pos.x += vx;
    this.pos.y += vy;
  }
  end() {
  }
  attack() {
  }
  protect() {
  }
  search() {
  }
  _count() {
    switch(this.action) {
      case actions.STOP: {
        this.count.stop += 1;
        break;
      }
      case actions.MOVE: {
        this.count.move += 1;
        break;
      }
      case actions.RUN: {
        this.count.run += 1;
        break;
      }
      case actions.ATTACK: {
        this.count.attack += 1;
        break;
      }
      case actions.PROTECT: {
        this.count.protect += 1;
        break;
      }
    }
  }
  _switchAction() {
    if (this.count.stop > 120) {
      this.count.stop = 0;
      this.action = actions.MOVE;
    }
    if (this.action === actions.MOVE && this.count.move % 120 === 0) {
      const dir = Math.floor(Math.random() * 3) - 1;
      this.pos.dir = (this.pos.dir + 20 * dir) % 360;
    }
  }
  _deg2rad(deg) {
    // rad = deg * (Math.PI / 180)
    return deg * (Math.PI / 180);
  }
  _rad2deg(rad) {
    // deg = rad / (Math.PI / 180);
    return rad / (Math.PI / 180);
  }
  render(canvas, ctx) {
    const dir = this._deg2rad(this.pos.dir); // rad
    const halfView = this._deg2rad(this.status.view) / 2; // rad

    // view
    ctx.beginPath();
    ctx.moveTo(this.pos.x, this.pos.y);
    ctx.arc(
      this.pos.x,
      this.pos.y,
      this.status.vision,
      dir + halfView,
      dir - halfView,
      true
    );
    ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.fill();

    // postion
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, 5, 0, Math.PI * 2, true);
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fill();
    ctx.strikeStyle = 'rgba(66, 66, 66, 1)';
    ctx.stroke();
  }
}
