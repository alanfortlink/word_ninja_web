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
    this.elapsed += dt;
    const p = Math.min(this.elapsed, this.duration) / this.duration;

    if (this.positive) {
      this.position = this.initialPosition.add(this.dir.mult(p));
    } else {
      applyMovement(this, dt);
    }

    if (this.elapsed > this.duration) {
      this.isDone = true;
    }
  }

  render() {
    context.save();
    context.translate(this.position.x, this.position.y);
    // context.rotate((this.elapsed / this.duration) * (2 * Math.PI));
    const alpha = this.elapsed > this.duration ? 0.0 : (0.9 - 0.9 * this.elapsed / this.duration);
    const lightGreen = `rgba(0, 255, 0, ${alpha})`;
    const lightRed = `rgba(255, 0, 0, ${alpha})`;

    context.fillStyle = this.positive ? lightGreen : lightRed;
    context.fillText(`${this.positive ? '+' : '❌'}${this.positive ? this.multiplier : ''}`, 0, 0);

    context.restore();
  }
}

export default Particle;
