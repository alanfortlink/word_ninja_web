import Game from './game.js';
import WordDB from './word_db.js';

let game = new Game(WordDB.getCommon500English());
let lastTimestamp = 0.0;

function gameLoop(timestamp) {
  const dt = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  game.update(dt);
  game.render();

  requestAnimationFrame(gameLoop);
}

document.onkeydown = (e) => game.onkeydown(e);
document.startNewGame = () => game.start();

requestAnimationFrame(gameLoop);
