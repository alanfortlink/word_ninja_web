import { language } from './language.js';

import { sound_profile, getProfile } from './sounds.js';
import { canvas } from './utils.js';

const $lastScore = document.getElementById('lastScore');
const $initialInfo = document.getElementById('initialInfo');
const $status = document.getElementById('status');
const $back = document.getElementById('back');
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
const $stats1 = document.getElementById('stats1');
const $stats2 = document.getElementById('stats2');

const statsHeight = canvas.height * 0.20;
const statsWidth = canvas.width * 0.45;

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

  static getWpm(events, i) {
    const span = 50;
    let l = Math.max(0, i - span);

    let totalHits = 0;
    let totalDuration = 0;

    for (let j = l; j <= i; j++) {
      const event = events[j];
      if (event.type == 'hit') {
        totalHits++;
      }

      totalDuration += event.duration;
    }

    const cps = (totalHits / 5) / totalDuration;
    const wpm = cps * 60;

    return wpm.toFixed(0);
  }

  static async generateStats($div, events, yMaxValue, yMapper) {
    let duration = 0;
    let totalDuration = events.reduce((acc, e) => acc + e.duration, 0);

    $div.innerHTML = '';
    $div.style.display = 'block';

    if (events.length > 0) events[0].duration *= 0.9;

    let html = `<div class='bubble'>${yMaxValue}</div>`;

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      duration += event.duration;

      const x = Math.floor((duration / totalDuration) * statsWidth * 0.8);
      const yValue = Math.min(Math.floor(yMapper(events, i)), yMaxValue);
      const y = Math.floor((yValue / yMaxValue) * statsHeight * 0.8);

      const multiplierClass = `multiplier-${event.multiplier}`;

      if (event.type == 'hit') {
        html += `<div class="stats-hit ${multiplierClass}" style="left: ${x}px; bottom: ${y}px;"><div class='bubble-content ${multiplierClass}'>${Math.floor(yValue).toFixed(0)}</div></div>`;
      } else {
        html += `<div class="stats-miss" style="left: ${x}px; bottom: ${y}px;"><div class='bubble-content ${multiplierClass}'>${Math.floor(yValue * yMaxValue).toFixed(0)}</div></div>`;
      }
    }

    const stats_30pLine = `<div class="stats-graph-line" style="bottom: ${Math.floor(statsHeight * 0.8 * 0.3)}px;">${(yMaxValue * 0.3).toFixed(0)}</div>`;
    const stats_60pLine = `<div class="stats-graph-line" style="bottom: ${Math.floor(statsHeight * 0.8 * 0.6)}px;">${(yMaxValue * 0.6).toFixed(0)}</div>`;
    const stats_maxLine = `<div class="stats-graph-line" style="bottom: ${Math.floor(statsHeight * 0.8)}px;">${(yMaxValue).toFixed(0)}</div>`;

    html += stats_30pLine;
    html += stats_60pLine;
    html += stats_maxLine;

    $div.innerHTML = html;
  }

  static async processStats(game) {
    const events = game.events;

    const maxWpm = events.map((_, i) => this.getWpm(events, i)).reduce((acc, wpm) => Math.max(acc, wpm), 0);

    this.generateStats($stats1, events, maxWpm, (events, i) => {
      return this.getWpm(events, i);
    });

    const totalScore = events.reduce((acc, e) => acc + e.multiplier, 0);

    this.generateStats($stats2, events, totalScore, (events, i) => {
      return events.slice(0, i + 1).reduce((acc, e) => acc + e.multiplier, 0);
    });
  }

  static showEndScreen(game) {
    const score = game.events.reduce((acc, e) => acc + e.multiplier, 0);
    const maxCombo = game.maxCombo;
    const time = game.gameElapsed;

    $initialInfo.innerHTML = "";
    $lastScore.innerHTML = _buildInfo(language == 'en' ? 'Score' : 'Pontuação', score);
    $streak.innerHTML = _buildInfo(language == 'en' ? 'Max Streak' : 'Maior Sequência', maxCombo);
    $status.innerHTML = '<div class="divider"></div>' + _buildInfo(language == 'en' ? 'Press "Space" to play again' : 'Pressione "Espaço" para jogar novamente', "");
    $back.innerHTML = _buildInfo(language == 'en' ? 'Press "b" go back to main menu' : 'Pressione "b" para voltar ao menu principal', "");

    this.processStats(game);

    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);

    const time_s = (min > 0 ? min + 'm' : '') + sec + 's';

    const { rankIcon, rankName, c, ranksAlt } = _getRankInfo(score, game);

    $rank.innerHTML = _buildInfo('<div class="divider" id="secondDivider"></div>', rankIcon.repeat(c) + ' ' + rankName, ranksAlt.join(''));
    $finalTime.innerHTML = _buildInfo(language == 'en' ? 'Time' : 'Duração', time_s);

    GameUI.showButtons();
  }

  static showStartScreen() {
    const soundProfile = getProfile();

    const allOptions = {
      'en': [
        ["Space", "Play"],
        ["Esc", "Pause"],
        ["Enter", "Power-up"],
        ["Backspace", "Switch"],
        ["L", "Language"],
        ["K", `Keyboard Sound (${sound_profile})`],
      ],
      'ptbr': [
        ["Espaço", "Jogar"],
        ["Esc", "Pausar"],
        ["Enter", "Especial"],
        ["Backspace", "Trocar"],
        ["L", "Idioma"],
        ["K", `Som do Teclado (${sound_profile})`],
      ]
    };

    const options = allOptions[language];

    let $table = "<table id='instructions'>";

    for (let [key, value] of options) {
      $table += `<tr><td>${key}</td><td>-></td><td>${value}</td></tr>`;
    }

    $table += "</table>";

    $initialInfo.innerHTML = $table;
    $lastScore.innerHTML = "";
    $streak.innerHTML = "";
    $status.innerHTML = "";
    $back.innerHTML = "";
    $rank.innerHTML = "";
    $finalTime.innerHTML = "";
    $stats1.style.width = statsWidth + 'px';
    $stats1.style.height = statsHeight + 'px';

    $stats2.style.width = statsWidth + 'px';
    $stats2.style.height = statsHeight + 'px';

    $stats1.style.display = 'none';
    $stats2.style.display = 'none';

    GameUI.showButtons();
  }

  static prepareGame() {
    $lastScore.innerHTML = '';
    $initialInfo.innerHTML = '';
    $status.innerHTML = '';
    $back.innerHTML = '';
    $streak.innerHTML = '';

    GameUI.hideButtons();
  }

  static updateInfo(game) {
    const score = game.events.reduce((acc, e) => acc + e.multiplier, 0);
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
