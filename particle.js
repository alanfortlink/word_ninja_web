import { context, applyMovement } from './utils.js';

class Particle {
  constructor(game, position, velocity, char) {
    this.game = game;
    this.position = position;
    this.velocity = velocity;
    this.char = char;
    this.isDone = false;
    this.elapsed = 0;
    this.multiplier = this.game.multiplier;
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
    // context.rotate((this.elapsed / 2.0) * (2 * Math.PI));
    const duration = 1.0;
    context.globalAlpha = this.elapsed > duration ? 0.0 : (0.6 - 0.6 * this.elapsed / duration);

    context.fillStyle = 'white';
    context.opacity = 0.5;

    context.fillStyle = 'white';
    context.fillText(`+${this.multiplier}`, 0, 0);

    context.restore();
  }
}

export default Particle;
