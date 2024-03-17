import Word from './word.js';
import GameUI from './game_ui.js';
import Vec2 from './vec2.js';
import WordShooter from './word_shooter.js';

class Game {
  constructor(dictionary) {
    this.canvas = document.getElementById("gameCanvas");
    this.context = this.canvas.getContext("2d");
    this.score = 0;
    this.combo = 0;
    this.gameElapsed = 0;
    this.gameRunning = false;
    this.wordShooter = new WordShooter(this.canvas, dictionary, this);
    this.multiplier = 1;
    this.lastSecondChecked = 0;
  }

  updateOverlay() {
    if (!this.gameRunning) return;
    GameUI.updateInfo(this.gameElapsed, this.score, this.lives, this.multiplier, this.combo);
  }

  endGame() {
    this.gameRunning = false;
    GameUI.showEndScreen(this.score);
  }

  onkeydown(e) {
    if (!this.gameRunning) {
      return;
    }

    const c = e.key;

    if (c == "Backspace") {
      for (let word of this.wordShooter.words) {
        word.selected = false;
      }
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
    }

    if (selectedWord != null && selectedWord != undefined) {
      if (selectedWord.check(c)) {
        this.score += 1 * this.multiplier;

        if (selectedWord.isFinished()) {
          this.combo += 1;

          if (this.combo % 5 == 0) {
            this.multiplier++;
          }
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
      this.updateOverlay();
      this.gameElapsed += dt;
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.wordShooter.update(dt);
    }

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
    this.wordShooter.render(this.context);
  }

}

export default Game;
