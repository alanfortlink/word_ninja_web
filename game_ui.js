import { language } from './language.js';

import { sound_profile, getProfile } from './sounds.js';
import { canvas } from './utils.js';

const $lastScore = document.getElementById('lastScore');
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

const statsHeight = canvas.height * 0.25;
const statsWidth = canvas.width * 0.4;

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

  static async processStats(game) {
    const events = game.events;
    let totalDuration = 0;
    let totalHits = 0;

    $stats1.innerHTML = '';
    $stats2.innerHTML = '';

    $stats1.style.display = 'block';
    $stats2.style.display = 'block';

    let k = 0;
    let c = 0;

    if (events.length > 0) events[0].duration *= 0.9;
    const durSum = events.reduce((acc, e) => acc + e.duration, 0);

    let maxWpm = 0;
    for (let i = 0; i < events.length; i++) {
      maxWpm = Math.max(maxWpm, this.getWpm(events, i));
    }

    const totalScore = events.reduce((acc, e) => acc + e.multiplier, 0);
    let score = 0;

    let html = `<div id='bubble1' class='bubble'>${maxWpm}</div>`;
    let html2 = `<div id='bubble2' class='bubble'>${totalScore}</div>`;

    for (let i = 0; i < events.length; i++) {
      c += 1;
      const event = events[i];
      if (event.type == 'hit') {
        totalHits++;
        score += event.multiplier;
      }

      totalDuration += event.duration;

      // if(i % 4 != 0) continue;

      const wpm = this.getWpm(events, i);

      const x = Math.floor((totalDuration / durSum) * statsWidth * 0.8);
      const y = Math.floor((wpm / maxWpm) * statsHeight * 0.8);

      const x2 = Math.floor((totalDuration / durSum) * statsWidth * 0.8);
      const y2 = Math.floor((score / totalScore) * statsHeight * 0.8);

      const multiplierClass = `multiplier-${event.multiplier}`;

      if (event.type == 'hit') {
        html += `<div class="stats-hit ${multiplierClass}" style="left: ${x}px; bottom: ${y}px;">${wpm}</div>`;
        html2 += `<div class="stats-hit ${multiplierClass}" style="left: ${x2}px; bottom: ${y2}px;">${score}</div>`;
      } else {
        html += `<div class="stats-miss" style="left: ${x}px; bottom: ${y}px;"></div>`;
        html2 += `<div class="stats-miss" style="left: ${x2}px; bottom: ${y2}px;"></div>`;
      }

      k += 1;
    }

    const stats1_30pLine = `<div class="stats-graph-line" style="bottom: ${Math.floor(statsHeight * 0.8 * 0.3)}px;">${(maxWpm * 0.3).toFixed(0)}</div>`;
    const stats1_60pLine = `<div class="stats-graph-line" style="bottom: ${Math.floor(statsHeight * 0.8 * 0.6)}px;">${(maxWpm * 0.6).toFixed(0)}</div>`;
    const stats1_maxLine = `<div class="stats-graph-line" style="bottom: ${Math.floor(statsHeight * 0.8)}px;">${(maxWpm).toFixed(0)}</div>`;

    html += stats1_30pLine;
    html += stats1_60pLine;
    html += stats1_maxLine;

    const stats2_30pLine = `<div class="stats-graph-line" style="bottom: ${Math.floor(statsHeight * 0.8 * 0.3)}px;">${(totalScore * 0.3).toFixed(0)}</div>`;
    const stats2_60pLine = `<div class="stats-graph-line" style="bottom: ${Math.floor(statsHeight * 0.8 * 0.6)}px;">${(totalScore * 0.6).toFixed(0)}</div>`;
    const stats2_maxLine = `<div class="stats-graph-line" style="bottom: ${Math.floor(statsHeight * 0.8)}px;">${(totalScore).toFixed(0)}</div>`;

    html2 += stats2_30pLine;
    html2 += stats2_60pLine;
    html2 += stats2_maxLine;

    $stats1.innerHTML = html;
    $stats2.innerHTML = html2;
  }

  static showEndScreen(game) {
    const score = game.score;
    const maxCombo = game.maxCombo;
    const time = game.gameElapsed;

    $lastScore.innerHTML = _buildInfo(language == 'en' ? 'Score' : 'Pontuação', score);
    $streak.innerHTML = _buildInfo(language == 'en' ? 'Max Streak' : 'Maior Sequência', maxCombo);
    $status.innerHTML = '<div class="divider"></div>' + _buildInfo(language == 'en' ? 'Press "Space" to play again' : 'Pressione "Espaço" para jogar novamente', "");
    $back.innerHTML = _buildInfo(language == 'en' ? 'Press "b" go back to main menu' : 'Pressione "b" para voltar ao menu principal', "");

    this.processStats(game);

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

    $lastScore.innerHTML = $table;
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
    $status.innerHTML = '';
    $back.innerHTML = '';
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
