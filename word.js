import { context, applyMovement } from './utils.js';

class Word {
  constructor(game, word, position, velocity, onRemoveCallback) {
    this.game = game;
    this.word = word;
    this.position = position;
    this.velocity = velocity;
    this.onRemoveCallback = onRemoveCallback;
    this.selected = false;
    this.index = 0;
    this.elapsed = 0;
    this.isSpecialWord = this.game.gameElapsed >= 30 && Math.random() < 0.02;
    this.isSkull = this.game.gameElapsed >= 30 && !this.isSpecialWord && Math.random() < 0.01;
  }

  update(dt) {
    this.elapsed += dt;
    applyMovement(this, dt);
    if (this.position.y >= 600 && this.velocity.y > 0) {
      this.position.y = 600;
      this.onRemoveCallback(this);
    }
  }

  getWidth() {
    return context.measureText(this.getRemainingWord()).width;
  }

  render() {
    const textHeight = 30;

    context.fillStyle = 'yellow';

    const padding = 4;
    const textWidth = this.getWidth();

    context.font = `${textHeight}px ShareTechMono-Regular`;

    if (this.isSpecialWord) {
      context.fillText('❤️', this.position.x - 30, this.position.y);
      context.fillText('❤️', this.position.x + textWidth + 5, this.position.y);
    }

    if (this.isSkull) {
      context.fillText('💀', this.position.x - 30, this.position.y);
      context.fillText('💀', this.position.x + textWidth + 5, this.position.y);
    }

    if (this.selected) {
      context.fillStyle = 'white';
      context.fillRect(this.position.x - padding, this.position.y - padding - textHeight / 1.3, textWidth + 2 * padding, textHeight + 2 * padding);
    } else {
      context.fillStyle = 'black';
      context.fillText(this.getRemainingWord(), this.position.x + 1, this.position.y + 1);
      context.fillText(this.getRemainingWord(), this.position.x + 2, this.position.y + 2);
    }

    context.fillStyle = this.selected ? 'darkblue' : 'yellow';
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
