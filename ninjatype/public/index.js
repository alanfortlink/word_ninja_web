import Game from './game.js';
import { language, updateLanguage } from './language.js';
import { updateSoundProfile, playSound } from './sounds.js';

function goBack(){
  game = new Game(goBack);
}

let game = new Game(goBack);
let lastTimestamp = 0.0;

function gameLoop(timestamp) {
  const dt = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  game.update(dt);
  game.render();

  requestAnimationFrame(gameLoop);
}

document.onkeydown = (e) => {
  if (e.key == 'k' && !game.gameRunning && game.gameElapsed == 0 && !game.paused) {
    updateSoundProfile();
    game = new Game(goBack);
    return;
  }

  playSound();

  if (e.key == 'l' && !game.gameRunning && game.gameElapsed == 0 && !game.paused) {
    updateLanguage(language == 'en' ? 'ptbr' : 'en');
    game = new Game(goBack);
    return;
  }

  game.onkeydown(e);
};

requestAnimationFrame(gameLoop);
