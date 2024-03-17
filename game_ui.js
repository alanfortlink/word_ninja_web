const buttons = document.getElementById('buttons');
const buttonsParent = buttons.parentElement;
const lastScore = document.getElementById('lastScore');
const status = document.getElementById('status');

const divScore = document.getElementById('score');
const divTime = document.getElementById('time');
const divLives = document.getElementById('lives');
const divMultiplier = document.getElementById('multiplier');
const divCombo = document.getElementById('combo');

class GameUI {
  static showButtons() {
    buttonsParent.appendChild(buttons);
  }

  static hideButtons() {
    buttonsParent.removeChild(buttons);
  }

  static showEndScreen(score) {
    lastScore.innerHTML = 'Score: ' + score;
    status.innerHTML = 'Press "Start" to play again.';

    GameUI.showButtons();
  }

  static prepareGame() {
    lastScore.innerHTML = '';
    status.innerHTML = '';

    GameUI.hideButtons();
  }

  static updateInfo(timeLeft, score, lives, multiplier, combo) {
    divScore.innerHTML = GameUI.leftPad(score) + ' ★';
    divTime.innerHTML = timeLeft.toFixed(2) + ' ⌛';
    divLives.innerHTML = GameUI.leftPad(lives) + ' ♥';
    divMultiplier.innerHTML = GameUI.leftPad(multiplier) + ' x';
    divCombo.innerHTML = GameUI.leftPad(combo) + ' ♯';
  }

  static leftPad(n) {
    return ('00000' + n).slice(-5);
  }
}

export default GameUI;
