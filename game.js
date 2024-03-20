import GameUI from './game_ui.js';
import Vec2 from './vec2.js';
import WordShooter from './word_shooter.js';
import Particle from './particle.js';
import Border from './border.js';
import { canvas, context } from './utils.js';
// outr

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
    this.borders = [
      new Border('top', this),
      new Border('right', this),
      new Border('bottom', this),
      new Border('left', this),
    ];

    const context = canvas.getContext('2d');
    context.font = '20px ShareTechMono-Regular';
  }

  updateOverlay() {
    // alan
    if (!this.gameRunning) return;
    GameUI.updateInfo(this.gameElapsed, this.score, this.combo);
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
        const particle = new Particle(this, new Vec2(canvas.width / 2, canvas.height / 2), new Vec2(0, 0), c, false);
        this.particles.push(particle);
        this.resetCombo();
      }
    }

    if (selectedWord != null && selectedWord != undefined) {
      if (selectedWord.check(c)) {
        this.combo += 1;
        const m = this.multiplier;
        setTimeout(() => {
          this.score += m;
        }, 1000);

        const particle = new Particle(this, selectedWord.position, new Vec2(0, 0), c, true);
        this.particles.push(particle);

        if (this.combo % 10 == 0) {
          if (this.multiplier < 5) {
            this.multiplier++;
          }
        }
      } else {
        const particle = new Particle(this, selectedWord.position, new Vec2(0, 0), c, false);
        this.particles.push(particle);
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
    this.lives = 4;
    this.particles = [];
    this.maxCombo = 0;
    this.resetCombo();

    for (let border of this.borders) {
      border.reset();
    }
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

    for (let border of this.borders) {
      border.update(dt);
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
    // assis

  }

  render() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let particle of this.particles) {
      particle.render();
    }

    for (let border of this.borders) {
      border.render();
    }

    this.wordShooter.render();
  }

}

export default Game;
