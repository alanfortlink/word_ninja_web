import Vec2 from './vec2.js';

const canvas = document.getElementById('gameCanvas');

let gravityUtils = {
  getGravityAcceleration: function () {
    return new Vec2(0, canvas.height * 0.40);
  },
};

export default gravityUtils;
