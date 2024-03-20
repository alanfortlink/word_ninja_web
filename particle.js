import { context, canvas, applyMovement } from './utils.js';
import Vec2 from './vec2.js';

const topRight = new Vec2(canvas.width - 50, 30);

class Particle {
  constructor(game, position, velocity, char, positive) {
    this.game = game;
    this.initialPosition = position;
    this.position = position;
    this.velocity = velocity;
    this.char = char;
    this.isDone = false;
    this.elapsed = 0;
    this.multiplier = this.game.multiplier;
    this.positive = positive;
    this.dir = topRight.sub(position);
    this.duration = 1.0;
  }

  update(dt) {
    if (this.positive) {
      this.elapsed += dt;
      const p = Math.min(this.elapsed, this.duration) / this.duration;
      this.position = this.initialPosition.add(this.dir.mult(p));
    } else {
      applyMovement(this, dt);
      if (this.position.y >= 600 && this.velocity.y > 0) {
        this.position.y = 900;
        this.isDone = true;
      }
    }
  }

  render() {
    const lightGreen = '#00ff00';
    const lightRed = '#ff0000';

    context.save();
    context.translate(this.position.x, this.position.y);
    // context.rotate((this.elapsed / this.duration) * (2 * Math.PI));
    context.globalAlpha = this.elapsed > this.duration ? 0.0 : (0.9 - 0.9 * this.elapsed / this.duration);

    context.fillStyle = this.positive ? lightGreen : lightRed;
    context.opacity = 0.5;

    context.fillStyle = this.positive ? lightGreen : lightRed;
    context.fillText(`${this.positive ? '+' : '❌'}${this.positive ? this.multiplier : ''}`, 0, 0);

    context.restore();
  }
}

export default Particle;
