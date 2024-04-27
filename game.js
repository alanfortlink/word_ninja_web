import GameUI from './game_ui.js';
import Vec2 from './vec2.js';
import WordShooter from './word_shooter.js';
import Particle from './particle.js';
import Border from './border.js';
import { canvas, context } from './utils.js';
import { loadSounds } from './sounds.js';

class GameEvent {
  constructor(type, duration, multiplier) {
    this.type = type;
    this.duration = duration;
    this.multiplier = multiplier;
  }
}

class Game {
  constructor(goBack) {
    this.events = [];
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.gameElapsed = 0;
    this.gameRunning = false;
    this.wordShooter = new WordShooter(this);
    this.multiplier = 1;
    this.lastSecondChecked = 0;
    this.slows = 2;
    this.particles = [];
    this.paused = false;
    this.isSlow = false;
    this.slowElapsed = 0;
    this.goBack = goBack;
    this.timeSinceLastEvent = 0;
    this.borders = [
      new Border('left', this),
      new Border('right', this),
      new Border('top', this),
      new Border('bottom', this),
    ];
    loadSounds();

    const context = canvas.getContext('2d');
    context.font = '20px regular';

    GameUI.showStartScreen();
  }

  updateOverlay() {
    GameUI.updateInfo(this);
  }

  endGame() {
    this.gameRunning = false;
    GameUI.showEndScreen(this);
  }

  onkeydown(e) {
    const ignoreKeys = ['Shift', 'Alt', 'Control', 'Meta', 'Dead'];
    if (ignoreKeys.includes(e.key)) {
      return;
    }

    const c = e.key;
    if (c == "Escape" && this.gameRunning) {
      this.paused = !this.paused;
      return;
    }

    if (this.paused) {
      if (c == " ") {
        this.paused = false;
      } else if (c == "b") {
        this.goBack();
      }

      return;
    }

    if (!this.gameRunning) {
      if (c == " ") {
        this.start();
      } else if (c == "b") {
        this.goBack();
      }

      return;
    }

    if (c == "Enter") {
      if (this.slows > 0 && !this.isSlow) {
        this.isSlow = true;
        this.slowElapsed = 0;
        this.slows -= 1;
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
        const particle = new Particle(this, new Vec2(canvas.width / 2, canvas.height / 2), new Vec2(0, 0), '', false, 0);
        this.particles.push(particle);
        this.timeSinceLastEvent -= this.wordShooter.timeWasted;
        this.events.push(new GameEvent('miss', this.timeSinceLastEvent, this.multiplier));
        this.timeSinceLastEvent = 0;
        this.wordShooter.timeWasted = 0;
        this.resetCombo();
      }
    }

    if (selectedWord != null && selectedWord != undefined) {
      if (selectedWord.isSkull) {
        const particle = new Particle(this, selectedWord.position, new Vec2(0, 0), '', false, 0);
        this.particles.push(particle);
        this.timeSinceLastEvent -= this.wordShooter.timeWasted;
        this.events.push(new GameEvent('skull', this.timeSinceLastEvent, this.multiplier));
        this.wordShooter.timeWasted = 0;
        this.timeSinceLastEvent = 0;
        this.wordShooter.words = this.wordShooter.words.filter(w => w !== selectedWord);
        this.lives -= 1;
        this.resetCombo();

        if (this.lives == 0) {
          this.endGame();
        }

        return;
      }
      if (selectedWord.check(c)) {

        if (selectedWord.isFinished()) {
          if (selectedWord.isSpecialWord && this.lives < 5) {
            this.lives += 1;
          }
        }

        this.combo += 1;
        const particle = new Particle(this, selectedWord.position, new Vec2(0, 0), '', true, this.multiplier);
        this.particles.push(particle);
        this.timeSinceLastEvent -= this.wordShooter.timeWasted;
        this.events.push(new GameEvent('hit', this.timeSinceLastEvent, this.multiplier));
        this.wordShooter.timeWasted = 0;
        this.timeSinceLastEvent = 0;

        if (this.combo % 15 == 0) {
          if (this.multiplier < 5) {
            this.multiplier++;
          }
        }
      } else {
        const particle = new Particle(this, selectedWord.position, new Vec2(0, 0), '', false, 0);
        this.timeSinceLastEvent -= this.wordShooter.timeWasted;
        this.events.push(new GameEvent('miss', this.timeSinceLastEvent, this.multiplier));
        this.wordShooter.timeWasted = 0;
        this.timeSinceLastEvent = 0;
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
    this.slows = 2;
    this.wordShooter.reset();
    this.gameRunning = true;
    this.gameElapsed = 0;
    this.lastSecondChecked = 0;
    this.score = 0;
    this.lives = 4;
    this.particles = [];
    this.maxCombo = 0;
    this.resetCombo();
    this.events = [];

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
    if (this.paused) {
      return;
    }

    if (this.gameRunning) {
      this.timeSinceLastEvent += dt;

      if (this.isSlow) {
        this.slowElapsed += dt;
        dt = dt / 4;
        if (this.slowElapsed >= 4) {
          this.isSlow = false;
        }
      }

      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.gameElapsed += dt;
      this.wordShooter.update(dt);
      for (let particle of this.particles) {
        particle.update(dt);
      }
    }

    this.updateOverlay();

    for (let border of this.borders) {
      border.update(dt);
    }

    const doneParticles = this.particles.filter(p => p.isDone);

    for (let particle of doneParticles) {
      this.score += particle.multiplier;
    }

    this.particles = this.particles.filter(p => !p.isDone);

    const currentSecond = parseInt(this.gameElapsed);
    if (currentSecond == this.lastSecondChecked || this.lastSecondChecked == 0) {
      this.lastSecondChecked = currentSecond;
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
    context.fillStyle = 'rgba(0, 0, 0, 0.75)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let particle of this.particles) {
      particle.render();
    }

    for (let border of this.borders) {
      border.render();
    }

    if (this.paused) {
      context.save();
      context.fillStyle = 'white';
      context.font = '30px regular';

      const resumeText = 'Press <Space> to resume';
      const resumeTextWidth = context.measureText(resumeText).width;
      context.fillText(resumeText, canvas.width / 2 - resumeTextWidth / 2, canvas.height / 2 - 20);

      const backText = 'Press <b> to go back to menu';
      const backTextWidth = context.measureText(backText).width;

      context.fillText(backText, canvas.width / 2 - backTextWidth / 2, canvas.height / 2 + 20);
      context.restore();
      return;
    }

    this.wordShooter.render();
  }

}

export default Game;
