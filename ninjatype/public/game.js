import { GameUI, hideLeaderboard, isModalOpen } from './game_ui.js';
import Vec2 from './vec2.js';
import WordShooter from './word_shooter.js';
import Particle from './particle.js';
import Border from './border.js';
import { canvas, context } from './utils.js';
import { loadSounds } from './sounds.js';
import { language } from './language.js';
import { Network } from './network.js';

class GameEvent {
  constructor(type, duration, multiplier) {
    this.type = type; // hit, miss, skull
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
    this.gameEnded = false;
    this.wordShooter = new WordShooter(this);
    this.timeSinceEnd = 0;
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
    this.gameEnded = true;
    this.gameRunning = false;
    this.timeSinceEnd = 0;
    GameUI.showEndScreen(this);
  }

  async share(message) {
    const username = prompt((message || "") + "\n\n" + (language == 'en' ? 'Choose a nickname (16 characters max)' : 'Escolha um apelido: (máximo 16 caracteres)'));

    if (username == null) {
      return;
    }

    if (username.length == 0) {
      return;
    }

    if (username.length > 16) {
      alert(language == 'en' ? 'Nickname too long' : 'Apelido muito longo');
      return;
    }

    const gameplay = {
      username,
      score: this.events.reduce((acc, e) => acc + e.multiplier, 0),
      events: this.events.map(e => ({ type: e.type, duration: e.duration, multiplier: e.multiplier })),
    };

    const success = await Network.publish(gameplay);
    if (success) {
      alert(language == 'en' ? 'Gameplay shared' : 'Gameplay compartilhado');
      GameUI.showLeaderboard();
    } else {
      alert(language == 'en' ? 'Failed to share gameplay' : 'Falha ao compartilhar gameplay');
    }
  }

  async onkeydown(e) {
    if (this.gameEnded && this.timeSinceEnd < 2) {
      return;
    }

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
      } else if (c == "l") {
        GameUI.showLeaderboard();
      } else if (c == "s") {
        this.share();
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
        this.events.push(new GameEvent('miss', Math.max(0.001, this.timeSinceLastEvent), 0));
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
        this.events.push(new GameEvent('skull', Math.max(0.001, this.timeSinceLastEvent), 0));
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
        this.events.push(new GameEvent('hit', Math.max(0.001, this.timeSinceLastEvent), this.multiplier));
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
        this.events.push(new GameEvent('miss', Math.max(0.001, this.timeSinceLastEvent), 0));
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
    this.timeSinceEnd = 0;
    this.gameRunning = true;
    this.gameEnded = false;
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
    } else {
      this.timeSinceEnd += dt;
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
    if (currentSecond % 9 == 0) {
      this.wordShooter.increaseDifficulty();
    }
    // assis

  }

  render() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(20, 20, 20, 0.85)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let border of this.borders) {
      border.render();
    }

    for (let particle of this.particles) {
      particle.render();
    }

    if (this.paused) {
      context.save();
      context.fillStyle = 'white';
      context.font = '30px regular';

      const resumeTexts = {
        'en': 'Press "Space" to resume',
        'ptbr': 'Pressione "Espaço" para continuar',
      };

      const resumeText = resumeTexts[language];
      const resumeTextWidth = context.measureText(resumeText).width;
      context.fillText(resumeText, canvas.width / 2 - resumeTextWidth / 2, canvas.height / 2 - 20);

      const backTexts = {
        'en': 'Press "B" to go back to menu',
        'ptbr': 'Pressione "B" para voltar ao menu',
      };
      const backText = backTexts[language];
      const backTextWidth = context.measureText(backText).width;

      context.fillText(backText, canvas.width / 2 - backTextWidth / 2, canvas.height / 2 + 20);
      context.restore();
      return;
    }

    this.wordShooter.render();
  }

}

export default Game;
