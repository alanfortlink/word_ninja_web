import gravityUtils from './gravity_utils.js';

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
    const gravityAcc = gravityUtils.getGravityAcceleration().mult(dt);
    this.velocity = this.velocity.add(gravityAcc);
    this.position = this.position.add(this.velocity.mult(dt));

    if (this.position.y >= 600 && this.velocity.y > 0) {
      this.position.y = 900;
      this.onRemoveCallback(this);
    }
  }

  render(context) {
    context.fillStyle = this.selected ? 'white' : 'red';
    context.font = '30px Arial';
    context.fillText(this.getRemainingWord(), this.position.x, this.position.y);
  }

  getWord() {
    return this.word;
  }

  getRemainingWord() {
    return this.word.substring(this.index);
  }

  check(c){
    if (this.word[this.index] === c) {
      this.index++;
      if (this.index === this.word.length) {
        this.onRemoveCallback(this);
      }
      return true;
    }

    return false;
  }
}

export default Word;
