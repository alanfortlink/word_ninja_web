import { context, canvas, applyMovement } from './utils.js';
import Vec2 from './vec2.js';

const topRight = new Vec2(canvas.width - 50, 30);

class Particle {
  constructor(game, position, velocity, char, positive, multiplier) {
    this.game = game;
    this.initialPosition = position;
    this.position = position;
    this.velocity = velocity;
    this.char = char;
    this.isDone = false;
    this.elapsed = 0;
    this.positive = positive;
    this.multiplier = multiplier;
    this.dir = topRight.sub(position);
    this.duration = 1.0;
  }

  update(dt) {
    this.elapsed += dt;
    const p = Math.min(this.elapsed, this.duration) / this.duration;

    if (this.char != '') {
      applyMovement(this, dt);
    }
    else if (this.positive) {
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

    const alpha = this.elapsed > this.duration ? 0.0 : (0.9 - 0.9 * this.elapsed / this.duration);
    const lightRed = `rgba(255, 0, 0, ${alpha})`;

    const positiveColor = [
      `rgba(200, 200, 200, ${alpha})`,
      `rgba(255, 255, 4, ${alpha})`,
      `rgba(4, 217, 255, ${alpha})`,
      `rgba(255, 16, 240, ${alpha})`,
      `rgba(116, 255, 21, ${alpha})`,
    ][this.multiplier - 1];

    const txt = this.char == '' ? `${this.positive ? '+' : '❌'}${this.positive ? this.multiplier : ''}` : this.char;

    context.fillStyle = this.positive ? positiveColor : lightRed;
    context.fillText(txt, 0, 0);

    context.restore();
  }
}

export default Particle;
