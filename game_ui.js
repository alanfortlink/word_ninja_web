const $lastScore = document.getElementById('lastScore');
const $status = document.getElementById('status');
const $streak = document.getElementById('streak');
const $finalTime = document.getElementById('finalTime');

const $score = document.getElementById('score');
const $time = document.getElementById('time');
const $lives = document.getElementById('lives');
const $multiplier = document.getElementById('multiplier');
const $combo = document.getElementById('combo');
const $result = document.getElementById('resultDiv');

function _buildInfo(title, value) {
  return `<div class="result-title">${title}</div><div class="result-value">${value}</div>`;
}

class GameUI {
  static showButtons() {
    $result.style.display = 'block';
  }

  static hideButtons() {
    $result.style.display = 'none';
  }

  static showEndScreen(score, maxCombo, time) {
    $lastScore.innerHTML = _buildInfo('Score', score);
    $streak.innerHTML = _buildInfo('Max Streak', maxCombo);
    $status.innerHTML = '<div class="divider"></div>' + _buildInfo(`Press "Space" to play again`, "");

    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);

    const time_s = (min > 0 ? min + 'm' : '') + sec + 's';

    $finalTime.innerHTML = '<div class="result-title">Time</div><div class="result-value">' + time_s + "</div>";

    GameUI.showButtons();
  }

  static prepareGame() {
    $lastScore.innerHTML = '';
    $status.innerHTML = '';
    $streak.innerHTML = '';

    GameUI.hideButtons();
  }

  static updateInfo(timeLeft, score, lives, multiplier, combo) {
    $score.innerHTML = GameUI.leftPad(score) + ' ★';
    $time.innerHTML = timeLeft.toFixed(2) + ' ⌛';
    $lives.innerHTML = GameUI.leftPad(lives) + ' ♥';
    $multiplier.innerHTML = GameUI.leftPad(multiplier) + ' x';
    $combo.innerHTML = GameUI.leftPad(combo) + ' ♯';
  }

  static leftPad(n) {
    return ('000000' + n).slice(-6);
  }
}

export default GameUI;
