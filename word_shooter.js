import Word from './word.js';
import Vec2 from './vec2.js';
import Particle from './particle.js';
import { canvas } from './utils.js';

class WordShooter {
  constructor(dictionary, game) {
    this.words = [];
    this.dictionary = dictionary;
    this.simultaneousWords = 1;
    this.wordsWaiting = 0;
    this.timeSinceLastWord = 0;
    this.timeBetweenWords = 1.5;
    this.game = game;
  }

  updateWords(dt) {
    if (this.words.length >= this.simultaneousWords) {
      return;
    }

    if (this.timeSinceLastWord < this.timeBetweenWords) {
      this.timeSinceLastWord += dt;
      return;
    }

    if (this.wordsWaiting == 0) {
      return;
    }

    this.wordsWaiting--;
    this.timeSinceLastWord = 0;

    const width = canvas.width;
    const height = canvas.height;

    var word = null;

    // Select a word that doesn't conflict with the initials of the existing words
    while (true) {
      const cand = this.dictionary[parseInt(Math.random() * this.dictionary.length)];
      const initials = this.words.map(w => w.getRemainingWord()[0]);
      if (!initials.includes(cand[0])) {
        word = cand;
        break;
      }
    }

    const launch_x = 0.5 * Math.random() * width + width / 4;

    const min_velocity = 0.75 * height;
    const random_velocity = Math.random() * 0.15 * height;

    const throwAngleLimit = 60;
    const throwAngle = Math.random() * throwAngleLimit - throwAngleLimit / 2;

    const position = new Vec2(launch_x, height + 20);
    const velocity = (new Vec2(0, -1).rotated(throwAngle).mult(min_velocity + random_velocity));

    const onRemoveCallback = (word) => {
      this.words = this.words.filter(w => w !== word);

      if (word.isSkull) {
        return;
      }

      if (!word.isFinished()) {
        const v = canvas.height * 0.5;
        const maxAngle = 60;
        const diff = word.getWidth() / word.getRemainingWord().length;

        for (let i = 0; i < word.getRemainingWord().length; i++) {
          let c = word.getRemainingWord()[i];
          const angle = Math.random() * maxAngle - maxAngle / 2;
          const velocity = new Vec2(0, -v).rotated(angle);
          const p = new Particle(this.game, word.position.add(new Vec2(diff * i, 0)), velocity, c, false);
          this.game.particles.push(p);
        }

        if (this.game.lives == 1) {
          this.game.lives--;
          this.game.endGame();
          return;
        }

        if (this.game.lives > 1) {
          this.game.lives--;
          this.game.resetCombo();
          return;
        }

      }
    };

    this.words.push(new Word(this.game, word, position, velocity, onRemoveCallback));
  }

  update(dt) {
    if (this.words.length + this.wordsWaiting < this.simultaneousWords) {
      this.wordsWaiting++;
    }

    this.updateWords(dt);

    for (let word of this.words) {
      word.update(dt);
    }
  }

  render() {
    for (let word of this.words) {
      word.render();
    }
  }

  reset() {
    this.words = [];
    this.wordsWaiting = 0;
    this.timeSinceLastWord = 0;
    this.simultaneousWords = 1;
    this.timeBetweenWords = 1.5;
  }

  increaseDifficulty() {
    this.timeBetweenWords -= 0.08;
    if (this.simultaneousWords <= 4) {
      this.simultaneousWords++;
    }
  }

}

export default WordShooter;
