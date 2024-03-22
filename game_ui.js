const $lastScore = document.getElementById('lastScore');
const $status = document.getElementById('status');
const $streak = document.getElementById('streak');
const $finalTime = document.getElementById('finalTime');

const $score = document.getElementById('score');
const $time = document.getElementById('time');
const $combo = document.getElementById('combo');
const $result = document.getElementById('resultDiv');
const $lives = document.getElementById('lives');
const $slows = document.getElementById('slows');
const $rank = document.getElementById('rank');

function _buildInfo(title, value, alt) {
  const hover = alt ? `<div class="result-hover">${alt}</div>` : '';
  return `<div class="result-title">${title}</div><div class="result-value">${hover}${value}</div>`;
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

    // ranks based on speed
    const ranks = ['🐢', '🐇', '🐕', '🐎', '🐆', '🦅', '🚀', '⚡️', '👑', '🔥', '🌟', '🏅', '🥉', '🥈', '🥇'];
    const rankNames = ['Turtle', 'Rabbit', 'Dog', 'Horse', 'Cheetah', 'Eagle', 'Rocket', 'Lightning', 'King', 'Fire', 'Star', 'Medalist', 'Bronze', 'Silver', 'Gold'];

    const scorePerRank = 500;
    const rank = Math.floor(score / scorePerRank);

    const ranksAlt = [...ranks.map(r => (r + ' ')), '🏆'];

    const c = Math.ceil((score % scorePerRank) / 100);

    const rankIcon = rank < ranks.length ? ranks[rank] : '🏆';
    const rankName = rank < rankNames.length ? rankNames[rank] : 'Master';
    $rank.innerHTML = _buildInfo('Rank', rankIcon.repeat(c) + ' ' + rankName, ranksAlt.join(''));
    $finalTime.innerHTML = _buildInfo('Time', time_s);

    GameUI.showButtons();
  }

  static prepareGame() {
    $lastScore.innerHTML = '';
    $status.innerHTML = '';
    $streak.innerHTML = '';

    GameUI.hideButtons();
  }

  static updateInfo(game) {
    const score = game.score;
    const combo = game.combo;
    const elapsed = game.gameElapsed;

    $lives.innerHTML = '❤️'.repeat(game.lives);
    $slows.innerHTML = '⏳'.repeat(game.slows);

    let t_str = "";
    let minutes = Math.floor(elapsed / 60);
    let seconds = Math.floor(elapsed % 60);

    if (minutes > 0) {
      t_str += minutes + 'm';
    }

    t_str += seconds + 's';
    t_str = elapsed.toFixed(2) + 's';

    $score.innerHTML = GameUI.leftPad(score) + '⭐️';
    $time.innerHTML = t_str + '⏱️';
    $combo.innerHTML = GameUI.leftPad(combo) + '♯';
  }

  static leftPad(n) {
    return ('000000' + n).slice(-6);
  }
}

export default GameUI;
