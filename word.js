import gravityUtils from './gravity_utils.js';

class Word {
  constructor(canvas, word, position, velocity, onRemoveCallback) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.word = word;
    this.position = position;
    this.velocity = velocity;
    this.onRemoveCallback = onRemoveCallback;
    this.selected = false;
    this.index = 0;
  }

  update(dt) {
    const gravityAcc = gravityUtils.getGravityAcceleration().mult(dt);
    this.velocity = this.velocity.add(gravityAcc);
    this.position = this.position.add(this.velocity.mult(dt));

    if (this.position.y >= 600 && this.velocity.y > 0) {
      this.position.y = 900;
      this.onRemoveCallback(this);
    }
  }

  render() {
    const textHeight = 20;

    this.context.fillStyle = 'white';

    const padding = 4;
    const textWidth = this.context.measureText(this.getRemainingWord()).width;

    if (this.selected) {
      this.context.fillStyle = 'white';
      this.context.fillRect(this.position.x - padding, this.position.y - padding - textHeight / 1.3, textWidth + 2 * padding, textHeight + 2 * padding);
    } else {
      this.context.fillStyle = 'black';
      this.context.fillText(this.getRemainingWord(), this.position.x + 1, this.position.y + 1);
      this.context.fillText(this.getRemainingWord(), this.position.x + 2, this.position.y + 2);
    }

    this.context.fillStyle = this.selected ? 'darkblue' : 'white';
    this.context.fillText(this.getRemainingWord(), this.position.x, this.position.y);
  }

  getWord() {
    return this.word;
  }

  getRemainingWord() {
    return this.word.substring(this.index);
  }

  check(c) {
    if (this.word[this.index] === c) {
      this.index++;
      if (this.index === this.word.length) {
        this.onRemoveCallback(this);
      }
      return true;
    }

    return false;
  }

  isFinished() {
    return this.index === this.word.length;
  }
}

export default Word;
