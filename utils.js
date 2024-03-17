import Vec2 from './vec2.js';

const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const getGravityAcceleration = function() {
  return new Vec2(0, canvas.height * 0.40);
};

const applyGravity = function(entity, dt) {
  const gravity = getGravityAcceleration();
  entity.velocity = entity.velocity.add(gravity.mult(dt));
};

const applyMovement = function(entity, dt) {
  applyGravity(entity, dt);
  entity.position = entity.position.add(entity.velocity.mult(dt));
};

export { canvas, context, applyMovement, getGravityAcceleration };
