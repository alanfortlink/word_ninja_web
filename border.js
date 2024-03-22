import { canvas, context } from './utils.js';

// 4th - Bottom
// 3rd - Left
// 2nd - Top
// 1st - Right
const deathAnimation = {
  'right': 3,
  'top': 2,
  'left': 1,
  'bottom': 0,
};

class Border {
  constructor(side, game) {
    this.side = side;
    this.game = game;
    this.state = 'entering'; // entering, looping, exiting, out
    this.elapsed = 0;
    this.duration = 1.0;
  }

  update(dt) {
    this.elapsed += dt;

    if (this.state == 'entering') {
      if (this.elapsed >= this.duration) {
        this.state = 'looping';
        this.elapsed = 0;
      }
    } else if (this.state == 'looping') {
      if (deathAnimation[this.side] == this.game.lives) {
        this.state = 'exiting';
        this.elapsed = 0;
      }
    } else if (this.state == 'exiting') {
      if (this.elapsed >= this.duration) {
        this.state = 'out';
      }
    } else if (this.state == 'out') {
      this.elapsed = 0.0;
    }
  }

  render() {
    context.save();
    const padding = 2;
    let color = [255, 255, 255];

    let factor = 0;
    let opacity = null;
    if (this.state == 'entering') {
      factor = this.elapsed / this.duration;
    } else if (this.state == 'exiting') {
      color = [255, 0, 0];
      opacity = 1.0 - this.elapsed / this.duration;
      const blinks = 10;
      const blinkDuration = this.duration / blinks;

      const currentBlink = Math.floor(this.elapsed / blinkDuration);

      factor = 1 - (currentBlink % 2);
    } else if (this.state == 'out') {
      factor = 0.0;
    } else if (this.state == 'looping') {
      factor = 1.0;
    }

    factor = 1.0;

    if (opacity == null) opacity = factor;

    // context.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
    context.fillStyle = '#555555';
    const steps = canvas.width;

    const isWordBeingDestroyed = this.game.particles.some(p => p.char != '' && !p.positive);

    switch (this.side) {
      case 'right':
        context.fillRect(canvas.width - padding * factor, 0, padding * factor, canvas.height);
        break;
      case 'top':
        context.beginPath();
        context.lineWidth = 2;
        context.strokeStyle = '#555';
        context.moveTo(0, 10);
        for (let i = 0; i < steps - 1; i++) {
          const x = (i) * canvas.width / steps;
          const y = Math.sin(Math.PI * ((4 * this.elapsed) % 2) + i / 10) * 2.5 + 2.5;
          context.lineTo(x, y);
        }
        context.lineTo(canvas.width, 0);
        context.stroke();
        break;
      case 'left':
        context.fillRect(0, 0, padding * factor, canvas.height);
        break;
      case 'bottom':
        context.beginPath();
        context.lineWidth = 2;
        context.strokeStyle = isWordBeingDestroyed ? '#f00' : '#fff';
        context.moveTo(0, canvas.height - 10);
        for (let i = 0; i < steps - 1; i++) {
          const x = (i) * canvas.width / steps;
          const y = Math.sin(Math.PI * ((4 * this.elapsed) % 2) + i / 10) * 2.5 + canvas.height - 2.5;
          context.lineTo(x, y);
        }
        context.lineTo(canvas.width, canvas.height);
        context.stroke();
        break;
    }
    context.restore();
  }

  reset() {
    this.state = 'entering';
    this.elapsed = 0;
  }
}

export default Border;
