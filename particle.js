import gravityUtils from './gravity_utils.js';

class Particle {
  constructor(canvas, position, velocity, char) {
    this.position = position;
    this.velocity = velocity;
    this.char = char;
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.isDone = false;
    this.elapsed = 0;
  }

  update(dt) {
    this.elapsed += dt;
    const gravityAcc = gravityUtils.getGravityAcceleration().mult(dt);
    this.velocity = this.velocity.add(gravityAcc);
    this.position = this.position.add(this.velocity.mult(dt));

    if (this.position.y >= 600 && this.velocity.y > 0) {
      this.position.y = 900;
      this.isDone = true;
    }
  }

  render() {
    // rotate the canvas
    this.context.save();
    this.context.translate(this.position.x, this.position.y);
    this.context.rotate((this.elapsed / 2.0) * (2 * Math.PI));
    this.context.globalAlpha = this.elapsed > 0.5 ? 0.0 : (1.0 - this.elapsed / 0.5);

    this.context.fillStyle = 'white';
    this.context.opacity = 0.5;

    this.context.fillStyle = 'white';
    this.context.fillText(this.char, 0, 0);

    this.context.restore();
  }
}

export default Particle;
