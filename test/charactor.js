const test = require('ava');

const Charactor = require('../src/charactor').Charactor;

test.beforeEach(t => {
  t.context.c = new Charactor({});
});

test('constructor', t => {
  const c = t.context.c;
  t.deepEqual(c.getStatus(), {
    fitness: 50,
    stamina: 50,
    speed: 50,
    jump: 50,
    attack: 50,
    defense: 50,
    view: 50,
    vision: 50,
  });
  t.deepEqual(c.getState(), {
    fitness: 50,
    stamina: 50,
    speed: 50,
    jump: 50,
    attack: 50,
    defense: 50,
    view: 50,
    vision: 50,
  });
});
