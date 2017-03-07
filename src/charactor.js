const SCALE = 1;
const MAX_STAMINA = 10000;

const actions = {
  STOP: '__STOP',
  MOVE: '__MOVE',
  DISCOVER: '__DISCOVER',
  RECOGNIZE: '__RECOGNIZE',
};

function _deg2rad(deg) {
  // rad = deg * (Math.PI / 180)
  return deg * (Math.PI / 180);
}

function _rad2deg(rad) {
  // deg = rad / (Math.PI / 180);
  return rad / (Math.PI / 180);
}

function range(value, min, max) {
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  }
  return value;
}

export default class Charactor {
  constructor({curiosity = 50, intelligence = 1, speed = 50, view = 120, vision = 1, x = 0, y = 0, dir = 45} = {}) {
    this.count = 0;
    this.fullCount = 0;
    this.action = actions.STOP;
    this.status = {
      // stateに影響
      stamina: MAX_STAMINA,

      // stopの待機時間
      // discover時の近くスピード
      curiosity: Math.round(range(curiosity, 1, 100)),

      // discoverからrecognizeまでの時間
      // recognizeから次のactionまでの時間
      intelligence: Math.round(range(intelligence, 1, 100)),

      // 移動速度
      speed: Math.round(range(speed, 1, 100)),

      // 視野の広さ(deg)
      view: Math.round(range(view, 10, 240)),

      // 視力
      vision: Math.round(range(vision, 1, 100)) / SCALE,
    };
    this.state = {};
    this.pos = {
      x,
      y,
      dir, // (deg)
    };
  }
  getStatus() {
    return this.status;
  }
  getState() {
    return this.state;
  }
  getPos() {
    return this.pos;
  }
  _count() {
    this.count += 1;
    this.fullCount += 1;
  }
  setDir(dir) {
    if (dir < 0) {
      this.pos.dir = 360 + dir;
    } else {
      this.pos.dir = dir % 360;
    }
  }
  _calcV(mag, stamina = true) {
    const vx = this.state.speed * Math.cos(_deg2rad(this.pos.dir)) * mag / 20 / SCALE;
    const vy = this.state.speed * Math.sin(_deg2rad(this.pos.dir)) * mag / 20 / SCALE;
    if (stamina) {
      const per = 0.5 * Math.sqrt(this.state.stamina / this.status.stamina, 2) + 0.5;
      return {
        vx: per * vx,
        vy: per * vy,
      };
    }
    return {vx, vy};
  }
  recoverStamina(value) {
    this.state.stamina += value;
    if (this.state.stamina >= MAX_STAMINA) {
      this.state.stamina = MAX_STAMINA;
    }
  }
  consumeStamina(value) {
    this.state.stamina -= value;
    if (this.state.stamina <= 0) {
      this.state.stamina = 0;
    }
  }

  start() {
    this.state = Object.assign({}, this.status);
  }
  update(canvas) {
    this._count();

    if (this.action === actions.STOP) {
      this.recoverStamina(5);

      if ((this.state.stamina / this.status.stamina) > 0.9 && this.count > (100 - this.state.curiosity) + 20) {
        this.switchAction(actions.MOVE);
      }
    } else if (this.action === actions.MOVE) {
      this.consumeStamina(1);

      if (this.state.stamina <= 0) {
        this.switchAction(actions.STOP);
      }

      const mag = 0.2;
      const {vx, vy} = this._calcV(mag);

      this.pos.x += vx;
      this.pos.y += vy;

      if (this.count !== 0 && this.count % 120 === 0) {
        const dir = Math.floor(Math.random() * 3) - 1;
        this.setDir(this.pos.dir + 20 * dir);
      }
      if (this.pos.y <= 0) {
        this.setDir(this.pos.dir - 180);
      } else if (this.pos.y > canvas.height) {
        this.setDir(this.pos.dir - 180);
      } else if (this.pos.x > canvas.width) {
        this.setDir(180 - this.pos.dir);
      } else if (this.pos.x <= 0) {
        this.setDir(180 - this.pos.dir);
      }
    } else if (this.action === actions.DISCOVER) {
      this.consumeStamina(2);

      const mag = this.state.curiosity / 100;
      const {vx, vy} = this._calcV(mag);

      this.pos.x += vx;
      this.pos.y += vy;
    } else if (this.action === actions.RECOGNIZE) {
      this.consumeStamina(4);

      const mag = 0;
      const {vx, vy} = this._calcV(mag, false);

      this.pos.x += vx;
      this.pos.y += vy;

      if (this.count > 240 - (240 * (this.state.intelligence / 100))) {
        this.setDir(this.pos.dir - 180);
        this.switchAction(actions.MOVE);
      }
    }
  }
  search(canvas, objects) {
    const discoveries = [];
    discoveries.push(this._discoverWall(canvas));
    // discoveries.push(this._discoverCharactor(objects));
    this.reaction(discoveries.filter(discovery => !!discovery.type));
  }
  reaction(discoveries) {
    discoveries.forEach(discovery => {
      switch(this.action) {
        case actions.MOVE: {
          if (discovery.type === 'wall') {
            this.setDir(discovery.dir);
            this.switchAction(actions.DISCOVER);
          }
        }
        case actions.DISCOVER: {
          if (discovery.type === 'wall') {
            if (discovery.distance < this.state.vision * (this.state.intelligence / 100)) {
              this.switchAction(actions.RECOGNIZE);
            }
          }
        }
      }
    });
  }
  switchAction(action) {
    if (this.action !== action) {
      this.count = 0;
      this.action = action;
    }
  }
  _discoverWall(canvas) {
    let type = null;
    let distance = null;
    let dir = this.pos.dir;
    const halfView = this.state.view / 2; // rad

    if (this.pos.y - this.state.vision < 0) {
      if (this.pos.dir - halfView < 270 && 270 < this.pos.dir + halfView) {
        type = 'wall';
        dir = 270;
        distance = this.pos.y;
      }
    } else if (this.pos.y + this.state.vision > canvas.height) {
      if (this.pos.dir - halfView < 90 && 90 < this.pos.dir + halfView) {
        type = 'wall';
        dir = 90;
        distance = canvas.height - this.pos.y;
      }
    } else if (this.pos.x + this.state.vision > canvas.width) {
      if (
        this.pos.dir - halfView < 0 && 0 < this.pos.dir + halfView ||
        this.pos.dir - halfView < 360 && 360 < this.pos.dir + halfView) {
        type = 'wall';
        dir = 0;
        distance = canvas.width - this.pos.x;
      }
    } else if (this.pos.x - this.state.vision < 0) {
      if (this.pos.dir - halfView < 180 && 180 < this.pos.dir + halfView) {
        type = 'wall';
        dir = 180;
        distance = this.pos.x;
      }
    }

    return {
      type,
      dir,
      distance,
    };
  }
  _discoverCharactor(objects) {
    objects.forEach(obj => {
      const pos = obj.getPos();
      if (this !== obj) {
        if (
        this.pos.y - this.state.vision < pos.y &&
          pos.y < this.pos.y + this.state.vision &&
          this.pos.x - this.state.vision < pos.x &&
          pos.x < this.pos.x + this.state.vision
      ) {
          console.log('Discover char!');
        }
      }
    });
  }
  render(canvas, ctx) {
    const dir = _deg2rad(this.pos.dir); // rad
    const halfView = _deg2rad(this.state.view) / 2; // rad

    // view
    ctx.beginPath();
    ctx.moveTo(this.pos.x, this.pos.y);
    ctx.arc(
      this.pos.x,
      this.pos.y,
      this.state.vision,
      dir + halfView,
      dir - halfView,
      true
    );
    ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.fill();

    // postion
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, 5 / SCALE, 0, Math.PI * 2, true);
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(66, 66, 66, 1)';
    ctx.stroke();

    // text
    switch(this.action) {
      case actions.STOP: {
        ctx.fillStyle = 'gray';
        break;
      }
      case actions.MOVE: {
        ctx.fillStyle = 'black';
        break;
      }
      case actions.DISCOVER: {
        ctx.fillStyle = 'red';
        break;
      }
      case actions.RECOGNIZE: {
        ctx.fillStyle = 'green';
        break;
      }
    }
    ctx.fillText(this.action, this.pos.x, this.pos.y);
    Object.keys(this.state).forEach((key, i) => {
      ctx.fillText(key + ': ' +this.state[key], this.pos.x, this.pos.y + 12 * (i + 1));
    });
  }
}
