import Word from './word.js';
import GameUI from './game_ui.js';
import Vec2 from './vec2.js';

class Game {
  constructor(words) {
    this.canvas = document.getElementById("gameCanvas");
    this.context = this.canvas.getContext("2d");
    this.score = 0;
    this.duration = 30;
    this.gameElapsed = 0;
    this.gameRunning = false;
    this.world = [];
    this.words = words;
  }

  updateOverlay() {
    if (!this.gameRunning) return;

    const timeLeft = this.duration - this.gameElapsed;
    if (timeLeft <= 0) {
      this.gameRunning = false;
      GameUI.showEndScreen(this.score);
      return;
    }

    GameUI.updateInfo(timeLeft, this.score);
  }

  spawnNewWord() {
    if (this.world.length > 3) {
      return;
    }

    const width = this.canvas.width;
    const height = this.canvas.height;

    var word = null;

    // Select a word that doesn't conflict with the initials of the existing words
    while (true) {
      const cand = this.words[parseInt(Math.random() * this.words.length)];
      const initials = this.world.map(w => w.getRemainingWord()[0]);
      if (!initials.includes(cand[0])) {
        word = cand;
        break;
      }
    }

    const launch_x = 0.5 * Math.random() * width + width / 4;

    const min_velocity = 0.55 * height;
    const random_velocity = Math.random() * 0.35 * height;

    const throwAngleLimit = 20;
    const throwAngle = Math.random() * throwAngleLimit - throwAngleLimit / 2;

    const position = new Vec2(launch_x, height + 20);
    const velocity = (new Vec2(0, -1).rotated(throwAngle).mult(min_velocity + random_velocity));

    const onRemoveCallback = (word) => {
      this.world = this.world.filter(w => w !== word);
      this.spawnNewWord();
    };

    this.world.push(new Word(word, position, velocity, onRemoveCallback));
  }

  onkeydown(e) {
    if (!this.gameRunning) {
      return;
    }

    const c = e.key;

    if (c == "Backspace") {
      for (let word of this.world) {
        word.selected = false;
      }
    }

    const selectedWords = this.world.filter(w => w.selected);
    var selectedWord = null;
    if (selectedWords.length > 0) {
      selectedWord = selectedWords[0];
    } else {
      const words = this.world.filter(w => w.getRemainingWord().startsWith(c));
      if (words.length > 0) {
        words[0].selected = true;
        selectedWord = words[0];
      }
    }

    if (selectedWord != null && selectedWord != undefined) {
      if (selectedWord.check(c)) {
        this.score += 1;
      }
    }
  }

  reset() {
    this.world = [];
    this.gameRunning = true;
    this.gameElapsed = 0;
    this.score = 0;
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
      this.spawnNewWord();
      this.gameElapsed += dt;
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (let word of this.world) {
        word.update(dt);
      }
    }
  }

  render() {
    for (let word of this.world) {
      word.render(this.context);
    }
  }

}

export default Game;
