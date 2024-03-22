import Game from './game.js';
import WordDB from './word_db.js';

let dict = 'en';

let game = new Game(dict == 'en' ? WordDB.getEn() : WordDB.getPtbr(), dict);
let lastTimestamp = 0.0;

function gameLoop(timestamp) {
  const dt = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  game.update(dt);
  game.render();

  requestAnimationFrame(gameLoop);
}

document.onkeydown = (e) => {
  if(e.key == 'l' && !game.gameRunning && !game.paused) {
    dict = dict == 'en' ? 'ptbr' : 'en';
    game = new Game(dict == 'en' ? WordDB.getEn() : WordDB.getPtbr(), dict);
    return;
  }

  game.onkeydown(e);
};

document.changeLanguage = () => {
  const $select = document.getElementById('language');
  const lang = $select.options[$select.selectedIndex].value;
  dict = lang;
  game = new Game(dict == 'en' ? WordDB.getEn() : WordDB.getPtbr(), dict);
}

requestAnimationFrame(gameLoop);
