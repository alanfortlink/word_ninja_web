import Word from './word.js';
import Vec2 from './vec2.js';
import Particle from './particle.js';
import WordDB from './word_db.js';
import { canvas } from './utils.js';
import { language } from './language.js';

class WordShooter {
  constructor(game) {
    this.words = [];
    this.simultaneousWords = 1;
    this.maxChars = 4;
    this.wordsWaiting = 0;
    this.timeSinceLastWord = 0;
    this.timeBetweenWords = 1.5;
    this.game = game;
    this.difficulty = 1;
    this.dictionary = WordDB.languages()[language];
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

    // Select a word that doesn't conflict with the initials of the existing words
    const initials = this.words.map(w => w.getRemainingWord()[0]);
    const candidates = this.dictionary.filter(w => w.length <= this.maxChars).filter(w => !initials.includes(w[0]));
    const word = candidates[Math.floor(Math.random() * candidates.length)];

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
          const angle = (i / word.getRemainingWord().length) * maxAngle - maxAngle / 2;
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
    this.maxChars = 4;
    this.timeBetweenWords = 1.5;
    this.difficulty = 1;
  }

  increaseDifficulty() {
    this.difficulty++;
    this.timeBetweenWords -= 0.08;
    if (this.simultaneousWords <= 4) {
      this.simultaneousWords++;
    }
    if(this.difficulty % 3 == 0) {
      this.maxChars++;
    }
  }

}

export default WordShooter;
