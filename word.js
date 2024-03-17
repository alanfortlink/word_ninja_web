import { context, applyMovement } from './utils.js';

class Word {
  constructor(word, position, velocity, onRemoveCallback) {
    this.word = word;
    this.position = position;
    this.velocity = velocity;
    this.onRemoveCallback = onRemoveCallback;
    this.selected = false;
    this.index = 0;
  }

  update(dt) {
    applyMovement(this, dt);
    if (this.position.y >= 600 && this.velocity.y > 0) {
      this.position.y = 900;
      this.onRemoveCallback(this);
    }
  }

  render() {
    const textHeight = 20;

    context.fillStyle = 'white';

    const padding = 4;
    const textWidth = context.measureText(this.getRemainingWord()).width;

    if (this.selected) {
      context.fillStyle = 'white';
      context.fillRect(this.position.x - padding, this.position.y - padding - textHeight / 1.3, textWidth + 2 * padding, textHeight + 2 * padding);
    } else {
      context.fillStyle = 'black';
      context.fillText(this.getRemainingWord(), this.position.x + 1, this.position.y + 1);
      context.fillText(this.getRemainingWord(), this.position.x + 2, this.position.y + 2);
    }

    context.fillStyle = this.selected ? 'darkblue' : 'white';
    context.fillText(this.getRemainingWord(), this.position.x, this.position.y);
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
