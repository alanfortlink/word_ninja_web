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

const statsHeight = canvas.height * 0.15;
const statsWidth = canvas.width * 0.40;

function getFormattedTime(elapsed) {
  let t_str = "";

  let remaining = elapsed;

  const days = Math.floor(elapsed / (60 * 60 * 24));

  remaining -= days * (60 * 60 * 24);

  const hours = remaining > 0 ? Math.floor(remaining / (60 * 60)) : 0;

  remaining -= hours * (60 * 60);

  const minutes = remaining > 0 ? Math.floor(remaining / 60) : 0;

  remaining -= minutes * 60;

  const seconds = Math.floor(remaining);

  if (days > 0) {
    t_str += days + 'd';
  }

  if (hours > 0) {
    t_str += hours + 'h';
  }

  if (minutes > 0) {
    t_str += minutes + 'm';
  }

  t_str += seconds + 's';

  return t_str;
}

function _getRankInfo(score, game) {
  // ranks based on speed
  const ranks = ['🐢', '🐇', '🐕', '🐎', '🐆', '🦅', '🚀', '⚡️', '👑', '🔥', '🌟', '🏅', '🥉', '🥈', '🥇'];
  const rankNamesEn = ['TURTLE', 'RABBIT', 'DOG', 'HORSE', 'CHEETAH', 'EAGLE', 'ROCKET', 'LIGHTNING', 'KING', 'FIRE', 'STAR', 'MEDALIST', 'BRONZE', 'SILVER', 'GOLD'];
  const rankNamesPtbr = ['TARTARUGA', 'COELHO', 'CACHORRO', 'CAVALO', 'GUEPARDO', 'ÁGUIA', 'FOGUETE', 'RAIO', 'REI', 'FOGO', 'ESTRELA', 'MEDALHISTA', 'BRONZE', 'PRATA', 'OURO'];

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
  const rankName = rank < rankNames.length ? rankNames[rank] : 'MASTER';

  return { rankIcon, rankName, c, ranksAlt };
}

let isLoadingLeaderboard = false;
let isLoadingStats = false;

async function updateLoading() {
  const loadingWord = language == "en" ? "LOADING..." : "CARREGANDO...";

  const totalDuration = 0.8;
  const stepDuration = totalDuration / loadingWord.length;

  while (isLoadingLeaderboard) {
    for (let i = 0; i < loadingWord.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, stepDuration * 1000));
      if (!isLoadingLeaderboard) {
        return;
      }

      $leaderboardModalContent.innerHTML = `<div class="leaderboard-content"><div class="loading-leaderboard">${loadingWord.substring(0, i + 1)}</div></div>`;
    }

    await new Promise((resolve) => setTimeout(resolve, 5 * stepDuration * 1000));
  }
}

async function updateLoadingStats() {
  const loadingWord = language == "en" ? "LOADING..." : "CARREGANDO...";

  const totalDuration = 0.8;
  const stepDuration = totalDuration / loadingWord.length;

  while (isLoadingStats) {
    for (let i = 0; i < loadingWord.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, stepDuration * 1000));
      if (!isLoadingStats) {
        return;
      }

      $back.innerHTML = `<div class="loading-stats">${loadingWord.substring(0, i + 1)}</div>`;
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 5 * stepDuration * 1000));
}

async function loadStats(game) {
  isLoadingStats = true;
  updateLoadingStats();
  const score = game.events.reduce((acc, e) => acc + e.multiplier, 0);
  const stats = await Network.getStats(score);
  const { topPercentage, isTop10 } = stats;

  isLoadingStats = false;

  let content = `<div class="stats-content">`;
  const text = language == 'en' ? `You are in the top <b>${topPercentage.toFixed(2)}%</b> of players` : `Você está no top ${topPercentage.toFixed(2)}% dos jogadores`;
  content += `<div class="stats-content-percentage">${text}</div>`;
  if (isTop10) {
    const text = language == 'en' ? 'You are in the top 10. Press "S" to share' : 'Você está no top 10. Pressione "S" para compartilhar';
    content += `<div class="stats-content-top10">${text}</div>`;
  }

  content += `</div>`;
  $back.innerHTML = content;
}

async function _showLeaderboard() {
  $leaderboardModal.classList.add('visible');
  $leaderboardModalContent.innerHTML = '';

  isLoadingLeaderboard = true;
  updateLoading();

  const gameplays = await Network.getGameplays();
  isLoadingLeaderboard = false;

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
    const created = gameplay.createdAt;
    const diff = new Date() - new Date(created);
    const timestamp = getFormattedTime(diff / 1000) + " ago";

    let gameplayHtml = `<div class="leaderboard-entry">`;
    gameplayHtml += `<div class="leaderboard-entry-created">${timestamp}</div>`;

    let infoColumn = `<div class="leaderboard-entry-info">`;

    const { rankIcon, c } = _getRankInfo(gameplay.score, gameplay);
    const alt = `${rankIcon.repeat(c)}`;

    const username = gameplay.username.length > 16 ? gameplay.username.substring(0, 13) + '...' : gameplay.username;

    infoColumn += `<div class="leaderboard-entry-info-item lb-other"><div class="lb-title lb-index">#${i + 1}</div></div>`;
    infoColumn += `<div class="leaderboard-entry-info-item lb-first"><div class="lb-title lb-highlight" title="${gameplay.username}">${username}</div><div class="lb-value">${alt}</div></div>`;
    infoColumn += `<div class="leaderboard-entry-info-item lb-other"><div class="lb-title">SCORE</div><div class="lb-value">${gameplay.score}</div></div>`;
    infoColumn += `<div class="leaderboard-entry-info-item lb-other"><div class="lb-title">STREAK</div><div class="lb-value">${maxStreak}</div></div>`;
    infoColumn += `<div class="leaderboard-entry-info-item lb-other"><div class="lb-title">TIME</div><div class="lb-value">${time}</div></div>`;
    infoColumn += `</div>`;

    let chartsColumn = `<div class="leaderboard-entry-charts">`;
    chartsColumn += `<div class="leaderboard-entry-chart chart-div chart-wpm" id="chart-wpm-${i}"></div>`;
    chartsColumn += `<div style="width: 20px;"></div>`;
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

  let html = ``;

  const diffX = statsWidth * 0.05;
  const diffY = statsHeight * 0.05;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    duration += event.duration;

    const x = diffX + Math.floor((duration / totalDuration) * statsWidth * 0.8);
    const yValue = Math.min(Math.floor(yMapper(events, i)), yMaxValue);
    const y = -diffY + Math.floor((yValue / yMaxValue) * statsHeight * 0.8);

    const multiplierClass = `multiplier-${event.multiplier}`;

    if (event.type == 'hit') {
      html += `<div class="stats-hit ${multiplierClass}" style="left: ${x}px; bottom: ${y}px;"><div class='bubble-content ${multiplierClass}'>${Math.floor(yValue).toFixed(0)}</div></div>`;
    } else {
      html += `<div class="stats-miss" style="left: ${x}px; bottom: ${y}px;"><div class='bubble-content ${multiplierClass}'>${Math.floor(yValue).toFixed(0)}</div></div>`;
    }
  }

  const stats_30pLine = `<div class="stats-graph-line" style="bottom: ${Math.floor(statsHeight * 0.8 * 0.3 - diffY)}px;">${(yMaxValue * 0.3).toFixed(0)}</div>`;
  const stats_60pLine = `<div class="stats-graph-line" style="bottom: ${Math.floor(statsHeight * 0.8 * 0.6 - diffY)}px;">${(yMaxValue * 0.6).toFixed(0)}</div>`;
  const stats_maxLine = `<div class="stats-graph-line" style="bottom: ${Math.floor(statsHeight * 0.8 - diffY)}px;">${(yMaxValue).toFixed(0)}</div>`;

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
    loadStats(game);

    const score = game.events.reduce((acc, e) => acc + e.multiplier, 0);
    const maxCombo = game.maxCombo;
    const time = game.gameElapsed;

    $initialInfo.innerHTML = "";
    //  $lastScore.innerHTML = _buildInfo(language == 'en' ? 'SCORE' : 'PONTUAÇÃO', score);
    //  $streak.innerHTML = _buildInfo(language == 'en' ? 'STREAK' : 'MAIOR SEQUÊNCIA', maxCombo);

    const scoreTxt = language == 'en' ? 'SCORE' : 'PONTUAÇÃO';
    $lastScore.innerHTML = `<div class="info-div-entry-title">${scoreTxt}</div><div class="info-div-entry-value">${score}</div>`;

    const streakTxt = language == 'en' ? 'STREAK' : 'MAIOR SEQUÊNCIA';
    $streak.innerHTML = `<div class="info-div-entry-title">${streakTxt}</div><div class="info-div-entry-value">${maxCombo}</div>`;

    const timeTxt = language == 'en' ? 'TIME' : 'DURAÇÃO';
    $finalTime.innerHTML = `<div class="info-div-entry-title">${timeTxt}</div><div class="info-div-entry-value">${getFormattedTime(time)}</div>`;

    const { rankIcon, rankName, c, ranksAlt } = _getRankInfo(score, game);

    $rank.innerHTML = `<div class="info-div-entry-title">${rankName}</div><div class="info-div-entry-value">${rankIcon.repeat(c)}</div>`;

    const allOptions = {
      'en': [
        ["SPACE", "RESTART"],
        ["B", "BACK"],
        ["S", "SHARE"],
        ["L", "LEADERBOARD"],
      ],
      'ptbr': [
        ["ESPAÇO", "REINICIAR"],
        ["B", "VOLTAR"],
        ["S", "COMPARTILHAR"],
        ["L", "RANKING"],
      ]
    };

    const options = allOptions[language];
    let $div = `<div class='buttons' style="">`;

    const windows = windows_fn(options, 2);

    for (let window of windows) {
      $div += "<div class='button-row'>";

      for (let [key, value] of window) {
        $div += `<div class="button-row-item"><div class="button-row-item-title">${key}</div><div class="button-row-item-value">> ${value}</div></div>`;
      }

      $div += "</div>";
    }

    $div += "</div>";

    let home = `<div style="display:flex; align-items: center; justify-content: center;">`;
    home += $div;
    home += `<div class="divider"></div>`;
    home += `</div>`;
    $status.innerHTML = home;

    $back.innerHTML = "";

    this.processStats(game);

    GameUI.showButtons();
  }

  static showStartScreen() {
    const soundProfile = getProfile();

    const allOptions = {
      'en': [
        ["SPACE", "PLAY"],
        ["ESC", "PAUSE"],
        ["ENTER", "POWER-UP"],
        ["BACKSPACE", "UNSELECT WORD"],
        ["'I' IDIOM", ` 🇬🇧 EN`],
        ["'S' SOUND", `${sound_profile}`],
      ],
      'ptbr': [
        ["ESPAÇO", "JOGAR"],
        ["ESC", "PAUSAR"],
        ["ENTER", "ESPECIAL"],
        ["BACKSPACE", "TROCAR PALAVRA"],
        ["'I' IDIOMA", "🇧🇷 PTBR"],
        ["'S' SOM", `${sound_profile}`],
      ]
    };

    const options = allOptions[language];
    const homeDivider = `<div class="home-screen-divider"></div>`;

    let home = `<div class="home-screen">`;

    let title = `<div class="home-screen-title"><img src='banner.jpg'/><div style="color: #eee;">NINJA TYPE</div><img class='rotated' src='banner.jpg'/></div>`;

    home += title;

    home += homeDivider;

    let $div = "<div class='buttons'>";

    const windows = windows_fn(options, 2);

    for (let window of windows) {
      $div += "<div class='button-row'>";

      for (let [key, value] of window) {
        $div += `<div class="button-row-item"><div class="button-row-item-title">${key}</div><div class="button-row-item-value">> ${value}</div></div>`;
      }

      $div += "</div>";
    }

    $div += "</div>";

    home += $div;

    home += homeDivider;

    let footer = `<div class="home-screen-footer">`;

    footer += `<div class="rank-button" id="open-rank">🏆  LEADERBOARD</div>`;

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
