import { language } from './language.js';

import { sound_profile, getProfile } from './sounds.js';
import { canvas } from './utils.js';

import { Network } from './network.js';

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

const $leaderboardModal = document.getElementById('leaderboard-modal');
const $leaderboardModalContent = document.getElementById('leaderboard-modal-content');
const $leaderboardModalClose = document.getElementById('leaderboard-modal-close');

$leaderboardModalClose.onclick = hideLeaderboard;

const statsHeight = canvas.height * 0.20;
const statsWidth = canvas.width * 0.45;

function getFormattedTime(elapsed) {
  let t_str = "";
  let minutes = Math.floor(elapsed / 60);
  let seconds = Math.floor(elapsed % 60);

  if (minutes > 0) {
    t_str += minutes + 'm';
  }

  t_str += seconds + 's';

  return t_str;
}

function _getRankInfo(score, game) {
  // ranks based on speed
  const ranks = ['🐢', '🐇', '🐕', '🐎', '🐆', '🦅', '🚀', '⚡️', '👑', '🔥', '🌟', '🏅', '🥉', '🥈', '🥇'];
  const rankNamesEn = ['Turtle', 'Rabbit', 'Dog', 'Horse', 'Cheetah', 'Eagle', 'Rocket', 'Lightning', 'King', 'Fire', 'Star', 'Medalist', 'Bronze', 'Silver', 'Gold'];
  const rankNamesPtbr = ['Tartaruga', 'Coelho', 'Cachorro', 'Cavalo', 'Guepardo', 'Águia', 'Foguete', 'Raio', 'Rei', 'Fogo', 'Estrela', 'Medalhista', 'Bronze', 'Prata', 'Ouro'];

  const rankNames = language == 'en' ? rankNamesEn : rankNamesPtbr;

  const scorePerRank = 500;
  const rank = Math.floor(score / scorePerRank);

  const nranks = 5;
  const windows = windows_fn(ranks, nranks);

  let ranksAlt = [];
  ranksAlt.push(`<table id='ranks'>`);

  for (let window of windows) {
    ranksAlt.push(`<tr>`);
    for (let r of window) {
      ranksAlt.push(`<td class="td-value">${r}</td>`);
      if (r != window[window.length - 1]) {
        ranksAlt.push(`<td class="td-info">→</td>`);
      }
    }
    ranksAlt.push(`</tr>`);
  }

  ranksAlt.push(`<tr><td class='big-value' colspan='${nranks * 2 - 1}'>🏆</td></tr>`);

  ranksAlt.push(`</table>`);

  const c = Math.max(1, Math.ceil((score % scorePerRank) / 100));

  const rankIcon = rank < ranks.length ? ranks[rank] : '🏆';
  const rankName = rank < rankNames.length ? rankNames[rank] : 'Master';

  return { rankIcon, rankName, c, ranksAlt };
}

async function _showLeaderboard() {
  $leaderboardModal.classList.add('visible');

  const gameplays = await Network.getGameplays();

  let leaderboard = `<div class="leaderboard-content">`;

  for (let i = 0; i < gameplays.length; i++) {
    const gameplay = gameplays[i];

    let maxStreak = 0;
    let streak = 0;

    let time = 0;

    for (let event of gameplay.events) {
      time += event.duration;
      if (event.type == 'hit') {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      }
      else {
        streak = 0;
      }
    }

    time = getFormattedTime(time);

    let gameplayHtml = `<div class="leaderboard-entry">`;

    let infoColumn = `<div class="leaderboard-entry-info">`;
    
    const { rankIcon, c } = _getRankInfo(gameplay.score, gameplay);
    const alt = `${rankIcon.repeat(c)}`;

    infoColumn += `<div class="leaderboard-entry-info-item lb-first"><div class="lb-title lb-highlight">#${i + 1}</div><div class="lb-value lb-highlight">${gameplay.username} ${alt}</div></div>`;
    infoColumn += `<div class="leaderboard-entry-info-item lb-other"><div class="lb-title">Score</div><div class="lb-value">${gameplay.score}</div></div>`;
    infoColumn += `<div class="leaderboard-entry-info-item lb-other"><div class="lb-title">Streak</div><div class="lb-value">${maxStreak}</div></div>`;
    infoColumn += `<div class="leaderboard-entry-info-item lb-other"><div class="lb-title">Time</div><div class="lb-value">${time}</div></div>`;
    infoColumn += `</div>`;

    let chartsColumn = `<div class="leaderboard-entry-charts">`;
    chartsColumn += `<div class="leaderboard-entry-chart chart-div chart-wpm" id="chart-wpm-${i}"></div>`;
    chartsColumn += `<div style="width: 10px;"></div>`;
    chartsColumn += `<div class="leaderboard-entry-chart chart-div chart-score" id="chart-score-${i}"></div>`;
    chartsColumn += `</div>`;

    gameplayHtml += infoColumn;

    gameplayHtml += `<div class="divider"></div>`;

    gameplayHtml += chartsColumn;

    gameplayHtml += `</div>`;

    leaderboard += gameplayHtml;
  }

  leaderboard += `</div>`;

  $leaderboardModalContent.innerHTML = leaderboard;

  for (let i = 0; i < gameplays.length; i++) {
    const gameplay = gameplays[i];

    const $wpm = document.getElementById(`chart-wpm-${i}`);
    const $score = document.getElementById(`chart-score-${i}`);

    $wpm.style.width = statsWidth + 'px';
    $wpm.style.height = statsHeight + 'px';

    $score.style.width = statsWidth + 'px';
    $score.style.height = statsHeight + 'px';

    const events = gameplay.events;

    const maxWpm = events.map((_, i) => getWpm(events, i)).reduce((acc, wpm) => Math.max(acc, wpm), 0);

    generateStats($wpm, events, maxWpm, (events, i) => {
      return getWpm(events, i);
    });

    const totalScore = events.reduce((acc, e) => acc + e.multiplier, 0);

    generateStats($score, events, totalScore, (events, i) => {
      return events.slice(0, i + 1).reduce((acc, e) => acc + e.multiplier, 0);
    });
  }
}

function hideLeaderboard() {
  $leaderboardModal.classList.remove('visible');
}

const windows_fn = (L, wsz) => {
  const windows = [];
  let current = [];
  for (let rank of L) {
    current.push(rank);
    if (current.length == wsz) {
      windows.push(current);
      current = [];
    }
  }

  if (current.length > 0) {
    windows.push(current);
  }

  return windows;
}



function _buildInfo(title, value, alt) {
  const hover = alt ? `<div class="result-hover">${alt}</div>` : '';
  return `<div class="result-title">${title}</div><div class="result-value"><div class="result-value-content">${hover}${value}</div></div>`;
}

async function generateStats($div, events, yMaxValue, yMapper) {
  let duration = 0;
  let totalDuration = events.reduce((acc, e) => acc + e.duration, 0);

  $div.innerHTML = '';
  $div.style.display = 'block';

  if (events.length > 0) events[0].duration *= 0.9;

  let html = ``;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    duration += event.duration;

    const x = Math.floor((duration / totalDuration) * statsWidth * 0.7);
    const yValue = Math.min(Math.floor(yMapper(events, i)), yMaxValue);
    const y = Math.floor((yValue / yMaxValue) * statsHeight * 0.8);

    const multiplierClass = `multiplier-${event.multiplier}`;

    if (event.type == 'hit') {
      html += `<div class="stats-hit ${multiplierClass}" style="left: ${x}px; bottom: ${y}px;"><div class='bubble-content ${multiplierClass}'>${Math.floor(yValue).toFixed(0)}</div></div>`;
    } else {
      html += `<div class="stats-miss" style="left: ${x}px; bottom: ${y}px;"><div class='bubble-content ${multiplierClass}'>${Math.floor(yValue).toFixed(0)}</div></div>`;
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

function getWpm(events, i) {
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

class GameUI {
  static showButtons() {
    $result.style.display = 'block';
  }

  static hideButtons() {
    $result.style.display = 'none';
  }




  static async processStats(game) {
    const events = game.events;

    const maxWpm = events.map((_, i) => getWpm(events, i)).reduce((acc, wpm) => Math.max(acc, wpm), 0);

    generateStats($stats1, events, maxWpm, (events, i) => {
      return getWpm(events, i);
    });

    const totalScore = events.reduce((acc, e) => acc + e.multiplier, 0);

    generateStats($stats2, events, totalScore, (events, i) => {
      return events.slice(0, i + 1).reduce((acc, e) => acc + e.multiplier, 0);
    });
  }

  static showEndScreen(game) {
    const score = game.events.reduce((acc, e) => acc + e.multiplier, 0);
    const maxCombo = game.maxCombo;
    const time = game.gameElapsed;

    $initialInfo.innerHTML = "";
    $lastScore.innerHTML = _buildInfo(language == 'en' ? 'Score' : 'Pontuação', score);
    $streak.innerHTML = _buildInfo(language == 'en' ? 'Streak' : 'Maior Sequência', maxCombo);

    let optionsTable = "<table id='instructions'>";

    optionsTable += "<tr class='key-row'>";
    optionsTable += `<td class="key-style" style="text-align: right;">Space</td><td>→</td><td style="text-align: left; font-weight: bold;">${language == 'en' ? 'Play Again' : 'Jogar Novamente'}</td>`;
    optionsTable += `<td class="key-style" style="text-align: right;">B</td><td>→</td><td style="text-align: left; font-weight: bold;">${language == 'en' ? 'Back to Menu' : 'Voltar ao Menu'}</td>`;
    optionsTable += "</tr>";

    optionsTable += "<tr class='key-row'>";
    optionsTable += `<td class="key-style" style="text-align: right;">S</td><td>→</td><td style="text-align: left; font-weight: bold;">${language == 'en' ? 'Share' : 'Compartilhar'}</td>`;
    optionsTable += `<td class="key-style" style="text-align: right;">L</td><td>→</td><td style="text-align: left; font-weight: bold;">${language == 'en' ? 'Leaderboard' : 'Leaderboard'}</td>`;
    optionsTable += "</tr>";

    optionsTable += "</table>";

    $status.innerHTML = optionsTable;
    $back.innerHTML = "";

    // $status.innerHTML = '<div class="divider"></div>' + _buildInfo(language == 'en' ? 'Press "Space" to play again' : 'Pressione "Espaço" para jogar novamente', "");
    // $back.innerHTML = _buildInfo(language == 'en' ? 'Press "B" go back to main menu' : 'Pressione "B" para voltar ao menu principal', "");

    this.processStats(game);

    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);

    const time_s = (min > 0 ? min + 'm' : '') + sec + 's';

    const { rankIcon, rankName, c, ranksAlt } = _getRankInfo(score, game);

    $rank.innerHTML = _buildInfo('<div class="divider" id="secondDivider"></div>' + rankName, rankIcon.repeat(c), ranksAlt.join(''));
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
        ["Backspace", "Unselected Word"],
        ["L", "Language"],
        ["S", `Sound (${sound_profile})`],
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
    const homeDivider = `<div class="home-screen-divider"></div>`;

    let home = `<div class="home-screen">`;

    let title = `<div class="home-screen-title">Ninja Type</div>`;

    home += title;

    home += homeDivider;

    let $table = "<table id='instructions'>";

    const windows = windows_fn(options, 2);

    for (let window of windows) {
      $table += "<tr class='key-row'>";
      $table += window.map(([key, value]) => `<td class="key-style" style="text-align: right;">${key}</td><td>→</td><td style="text-align: left; font-weight: bold;">${value}</td>`).join('');
      $table += "</tr>";
    }

    // for (let [key, value] of options) {
    //   $table += `<tr class="key-row"><td class="key-style" style="text-align: right;">${key}</td><td>→</td><td style="text-align: left; font-weight: bold;">${value}</td></tr>`;
    // }

    $table += "</table>";

    home += $table;

    home += homeDivider;

    let footer = `<div class="home-screen-footer">`;

    footer += `<div class="rank-button" id="open-rank">🏆 Leaderboard</div>`;

    footer += `</div>`;

    home += footer;

    $initialInfo.innerHTML = home;
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

    document.getElementById('open-rank').onclick = _showLeaderboard;

    GameUI.showButtons();
  }

  static showLeaderboard() {
    _showLeaderboard();
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

    const t_str = getFormattedTime(elapsed);

    $score.innerHTML = GameUI.leftPad(score) + '⭐️';
    $time.innerHTML = t_str + '⏱️';
    $combo.innerHTML = GameUI.leftPad(combo) + '♯';
  }

  static leftPad(n) {
    return ('000000' + n).slice(-6);
  }
}

export default GameUI;
