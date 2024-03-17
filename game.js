import GameUI from './game_ui.js';
import Vec2 from './vec2.js';
import WordShooter from './word_shooter.js';
import Particle from './particle.js';
import { canvas, context } from './utils.js';

class Game {
  constructor(dictionary) {
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.gameElapsed = 0;
    this.gameRunning = false;
    this.wordShooter = new WordShooter(dictionary, this);
    this.multiplier = 1;
    this.lastSecondChecked = 0;
    this.particles = [];

    const context = canvas.getContext('2d');
    context.font = '20px ShareTechMono-Regular';
  }

  updateOverlay() {
    if (!this.gameRunning) return;
    GameUI.updateInfo(this.gameElapsed, this.score, this.lives, this.multiplier, this.combo);
  }

  endGame() {
    this.gameRunning = false;
    GameUI.showEndScreen(this.score, this.maxCombo, this.gameElapsed);
  }

  onkeydown(e) {
    const c = e.key;

    if (!this.gameRunning) {
      if (c == " ") {
        this.start();
      }

      return;
    }

    if (c == " ") {
      return;
    }

    if (c == "Backspace") {
      for (let word of this.wordShooter.words) {
        word.selected = false;
      }
      return;
    }

    const selectedWords = this.wordShooter.words.filter(w => w.selected);
    var selectedWord = null;
    if (selectedWords.length > 0) {
      selectedWord = selectedWords[0];
    } else {
      const words = this.wordShooter.words.filter(w => w.getRemainingWord().startsWith(c));
      if (words.length > 0) {
        words[0].selected = true;
        selectedWord = words[0];
      }
      else {
        this.resetCombo();
      }
    }

    if (selectedWord != null && selectedWord != undefined) {
      if (selectedWord.check(c)) {
        this.combo += 1;
        this.score += 1 * this.multiplier;

        const particle = new Particle(selectedWord.position, new Vec2(selectedWord.velocity.x, -selectedWord.velocity.y * 1.2), c);
        this.particles.push(particle);

        if (this.combo % 25 == 0) {
          this.multiplier++;
        }
      } else {
        this.resetCombo();
      }
    }
  }

  resetCombo() {
    this.combo = 0;
    this.multiplier = 1;
  }

  reset() {
    this.wordShooter.reset();
    this.gameRunning = true;
    this.gameElapsed = 0;
    this.score = 0;
    this.lives = 3;
    this.particles = [];
    this.maxCombo = 0;
    this.resetCombo();
  }

  start() {
    if (!this.gameRunning) {
      GameUI.prepareGame();
      this.reset();
    }
  }

  update(dt) {
    if (this.gameRunning) {
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.updateOverlay();
      this.gameElapsed += dt;
      this.wordShooter.update(dt);
      for (let particle of this.particles) {
        particle.update(dt);
      }
    }

    this.particles = this.particles.filter(p => !p.isDone);

    const currentSecond = parseInt(this.gameElapsed);
    if (currentSecond == this.lastSecondChecked) {
      return;
    }

    this.lastSecondChecked = currentSecond;
    if (currentSecond % 10 == 0) {
      this.wordShooter.increaseDifficulty();
    }

  }

  render() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let particle of this.particles) {
      particle.render();
    }

    this.wordShooter.render();
  }

}

export default Game;
