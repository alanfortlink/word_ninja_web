import { language } from './language.js';

import { sound_profile, getProfile } from './sounds.js';

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
const $currentRank = document.getElementById('currentRank');

function _getRankInfo(score, game) {
  // ranks based on speed
  const ranks = ['🐢', '🐇', '🐕', '🐎', '🐆', '🦅', '🚀', '⚡️', '👑', '🔥', '🌟', '🏅', '🥉', '🥈', '🥇'];
  const rankNamesEn = ['Turtle', 'Rabbit', 'Dog', 'Horse', 'Cheetah', 'Eagle', 'Rocket', 'Lightning', 'King', 'Fire', 'Star', 'Medalist', 'Bronze', 'Silver', 'Gold'];
  const rankNamesPtbr = ['Tartaruga', 'Coelho', 'Cachorro', 'Cavalo', 'Guepardo', 'Águia', 'Foguete', 'Raio', 'Rei', 'Fogo', 'Estrela', 'Medalhista', 'Bronze', 'Prata', 'Ouro'];

  const rankNames = language == 'en' ? rankNamesEn : rankNamesPtbr;

  const scorePerRank = 500;
  const rank = Math.floor(score / scorePerRank);

  const ranksAlt = [...ranks.map(r => (r + ' ')), '🏆'];

  const c = Math.max(1, Math.ceil((score % scorePerRank) / 100));

  const rankIcon = rank < ranks.length ? ranks[rank] : '🏆';
  const rankName = rank < rankNames.length ? rankNames[rank] : 'Master';

  return { rankIcon, rankName, c, ranksAlt };
}

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

  static showEndScreen(game) {
    const score = game.score;
    const maxCombo = game.maxCombo;
    const time = game.gameElapsed;

    $lastScore.innerHTML = _buildInfo(language == 'en' ? 'Score' : 'Pontuação', score);
    $streak.innerHTML = _buildInfo(language == 'en' ? 'Max Streak' : 'Maior Sequência', maxCombo);
    $status.innerHTML = '<div class="divider"></div>' + _buildInfo(language == 'en' ? 'Press "Space" to play again' : 'Pressione "Espaço" para jogar novamente', "");

    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);

    const time_s = (min > 0 ? min + 'm' : '') + sec + 's';

    const { rankIcon, rankName, c, ranksAlt } = _getRankInfo(score, game);

    $rank.innerHTML = _buildInfo('Rank', rankIcon.repeat(c) + ' ' + rankName, ranksAlt.join(''));
    $finalTime.innerHTML = _buildInfo(language == 'en' ? 'Time' : 'Duração', time_s);

    GameUI.showButtons();
  }

  static showStartScreen() {
    const soundProfile = getProfile();
    if (language == 'en') {
      $status.innerHTML =
        `"Space" -> Play <br /> "Esc" -> Pause <br /> "Enter" -> Powerup <br /> "Backspace" -> Switch <br /> "L" -> Language <br /> "K" -> Keyboard Sound (${soundProfile})`;
    }
    else {
      $status.innerHTML =
        `"Espaço" -> Jogar <br /> "Esc" -> Pausar <br /> "Enter" -> Especial <br /> "Backspace" -> Trocar <br /> "L" -> Idioma <br /> "K" -> Som do Teclado (${soundProfile})`;
    }
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

    const { rankIcon, c } = _getRankInfo(score, game);
    $currentRank.innerHTML = rankIcon.repeat(c);

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
