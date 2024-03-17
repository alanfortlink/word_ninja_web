import { context, applyMovement } from './utils.js';

class Particle {
  constructor(position, velocity, char) {
    this.position = position;
    this.velocity = velocity;
    this.char = char;
    this.isDone = false;
    this.elapsed = 0;
  }

  update(dt) {
    this.elapsed += dt;

    applyMovement(this, dt);
    if (this.position.y >= 600 && this.velocity.y > 0) {
      this.position.y = 900;
      this.isDone = true;
    }
  }

  render() {
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate((this.elapsed / 2.0) * (2 * Math.PI));
    context.globalAlpha = this.elapsed > 0.5 ? 0.0 : (1.0 - this.elapsed / 0.5);

    context.fillStyle = 'white';
    context.opacity = 0.5;

    context.fillStyle = 'white';
    context.fillText(this.char, 0, 0);

    context.restore();
  }
}

export default Particle;
