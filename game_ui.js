const lastScore = document.getElementById('lastScore');
const status = document.getElementById('status');
const streakDiv = document.getElementById('streak');
const finalTimeDiv = document.getElementById('finalTime');

const divScore = document.getElementById('score');
const divTime = document.getElementById('time');
const divLives = document.getElementById('lives');
const divMultiplier = document.getElementById('multiplier');
const divCombo = document.getElementById('combo');
const resultDiv = document.getElementById('resultDiv');

class GameUI {
  static showButtons() {
    resultDiv.style.display = 'block';
  }

  static hideButtons() {
    resultDiv.style.display = 'none';
  }

  static showEndScreen(score, maxCombo, time) {
    lastScore.innerHTML = '<div class="result-title">Score</div><div class="result-value">' + score + "</div>";
    streakDiv.innerHTML = '<div class="result-title">Max Streak</div><div class="result-value">' + maxCombo + "</div>";
    status.innerHTML = '<div class="divider"></div><div class="result-title">Press "Space" to play again</div>';

    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);

    const time_s = (min > 0 ? min + 'm' : '') + sec + 's';

    finalTimeDiv.innerHTML = '<div class="result-title">Time</div><div class="result-value">' + time_s + "</div>";

    GameUI.showButtons();
  }

  static prepareGame() {
    lastScore.innerHTML = '';
    status.innerHTML = '';
    streakDiv.innerHTML = '';

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
    return ('000000' + n).slice(-6);
  }
}

export default GameUI;
