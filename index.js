import Word from './word.js';
import Vec2 from './vec2.js';

const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

var startButton = document.getElementById('startButton');
var startButtonParent = startButton.parentElement;

var score = 0;
var duration = 30;
var gameElapsed = 0;

var gameRunning = false;

var last_timestamp = 0;
var world = [];

// top 100 most popular words in English
var textWords = ["the",
  "be",
  "of",
  "and",
  "a",
  "to",
  "in",
  "he",
  "have",
  "it",
  "about",
  "than",
  "into",
  "could",
  "state",
  "only",
  "new",
  "year",
  "some",
  "take",
  "because",
  "good",
  "each",
  "those",
  "feel",
  "seem",
  "how",
  "high",
  "too",
  "place",
  "that",
  "for",
  "they",
  "I",
  "with",
  "as",
  "not",
  "on",
  "she",
  "at",
  "come",
  "these",
  "know",
  "see",
  "use",
  "get",
  "like",
  "then",
  "first",
  "any",
  "little",
  "world",
  "very",
  "still",
  "nation",
  "hand",
  "old",
  "life",
  "tell",
  "write",
  "by",
  "this",
  "we",
  "you",
  "do",
  "but",
  "from",
  "or",
  "which",
  "one",
  "work",
  "now",
  "may",
  "such",
  "give",
  "over",
  "think",
  "most",
  "even",
  "find",
  "become",
  "here",
  "show",
  "house",
  "Both",
  "between",
  "need",
  "mean",
  "call",
  "develop",
  "would",
  "all",
  "will",
  "there",
  "say",
  "who",
  "make",
  "when",
  "can",
  "more",
  "day",
  "also",
  "after",
  "way",
  "many",
  "must",
  "look",
  "before",
  "great",
  "back",
  "under",
  "last",
  "right",
  "move",
  "thing",
  "general",
  "school",
  "never",
  "same",
  "another",
  "if",
  "no",
  "man",
  "out",
  "other",
  "so",
  "what",
  "time",
  "up",
  "go",
  "through",
  "long",
  "where",
  "much",
  "should",
  "well",
  "people",
  "down",
  "own",
  "just",
  "begin",
  "while",
  "number",
  "part",
  "turn",
  "real",
  "leave",
  "might",
  "want",
  "point",
  "form",
  "off",
  "child",
  "few",
  "small",
  "since",
  "against",
  "ask",
  "late",
  "home",
  "city",
  "put",
  "close",
  "case",
  "force",
  "meet",
  "once",
  "water",
  "upon",
  "war",
  "though",
  "young",
  "less",
  "enough",
  "almost",
  "read",
  "include",
  "president",
  "nothing",
  "yet",
  "simple",
  "within",
  "love",
  "human",
  "along",
  "appear",
  "doctor",
  "believe",
  "speak",
  "active",
  "interest",
  "large",
  "person",
  "end",
  "open",
  "public",
  "follow",
  "during",
  "present",
  "without",
  "build",
  "hear",
  "light",
  "unite",
  "live",
  "every",
  "country",
  "bring",
  "center",
  "let",
  "better",
  "big",
  "boy",
  "cost",
  "business",
  "value",
  "second",
  "why",
  "clear",
  "expect",
  "student",
  "month",
  "drive",
  "concern",
  "best",
  "door",
  "hope",
  "example",
  "inform",
  "body",
  "again",
  "hold",
  "govern",
  "around",
  "possible",
  "head",
  "consider",
  "word",
  "program",
  "problem",
  "side",
  "try",
  "provide",
  "continue",
  "name",
  "certain",
  "power",
  "pay",
  "result",
  "question",
  "family",
  "complete",
  "act",
  "sense",
  "mind",
  "experience",
  "art",
  "next",
  "near",
  "direct",
  "ever",
  "least",
  "probable",
  "understand",
  "reach",
  "effect",
  "different",
  "idea",
  "whole",
  "control",
  "however",
  "lead",
  "system",
  "set",
  "order",
  "eye",
  "plan",
  "run",
  "keep",
  "face",
  "study",
  "woman",
  "member",
  "until",
  "far",
  "night",
  "always",
  "service",
  "away",
  "report",
  "car",
  "law",
  "industry",
  "important",
  "girl",
  "god",
  "several",
  "matter",
  "usual",
  "rather",
  "condition",
  "field",
  "pass",
  "fall",
  "note",
  "special",
  "talk",
  "particular",
  "today",
  "measure",
  "fact",
  "group",
  "play",
  "stand",
  "increase",
  "early",
  "course",
  "change",
  "help",
  "line",
  "something",
  "company",
  "week",
  "church",
  "toward",
  "start",
  "social",
  "room",
  "figure",
  "nature",
  "per",
  "often",
  "kind",
  "among",
  "white",
  "reason",
  "action",
  "return",
  "foot",
  "care",
  "walk",
  "teach",
  "low",
  "hour",
  "type",
  "carry",
  "rate",
  "remain",
  "full",
  "street",
  "easy",
  "although",
  "record",
  "sit",
  "determine",
  "level",
  "local",
  "sure",
  "receive",
  "thus",
  "agree",
  "arm",
  "mother",
  "across",
  "quite",
  "anything",
  "town",
  "past",
  "view",
  "society",
  "success",
  "minute",
  "remember",
  "purpose",
  "test",
  "fight",
  "watch",
  "situation",
  "south",
  "outside",
  "moment",
  "spirit",
  "train",
  "college",
  "religion",
  "perhaps",
  "music",
  "grow",
  "free",
  "cause",
  "manage",
  "answer",
  "break",
  "organize",
  "half",
  "fire",
  "lose",
  "money",
  "stop",
  "actual",
  "ago",
  "difference",
  "stage",
  "father",
  "table",
  "rest",
  "bear",
  "entire",
  "market",
  "prepare",
  "serve",
  "age",
  "book",
  "board",
  "recent",
  "sound",
  "office",
  "cut",
  "step",
  "class",
  "already",
  "effort",
  "wait",
  "department",
  "able",
  "political",
  "learn",
  "voice",
  "air",
  "together",
  "explain",
  "offer",
  "plant",
  "charge",
  "ground",
  "west",
  "picture",
  "hard",
  "front",
  "lie",
  "true",
  "history",
  "position",
  "above",
  "strong",
  "friend",
  "necessary",
  "add",
  "court",
  "deal",
  "shall",
  "cover",
  "common",
  "subject",
  "draw",
  "short",
  "wife",
  "treat",
  "limit",
  "road",
  "modern",
  "dark",
  "surface",
  "rule",
  "regard",
  "dance",
  "peace",
  "observe",
  "future",
  "wall",
  "tax",
  "support",
  "party",
  "whether",
  "either",
  "land",
  "material",
  "happen",
  "education",
  "Death",
  "letter",
  "color",
  "behind",
  "produce",
  "send",
  "term",
  "total",
  "university",
  "rise",
  "century",
  "farm",
  "claim",
  "firm",
  "operation",
  "further",
  "pressure",
  "property",
  "morning",
  "amount",
  "top",
];


function newWord() {
  if (world.length > 3) {
    return;
  }

  const width = canvas.width;
  const height = canvas.height;

  var word = null;

  while (true) {
    const cand = textWords[parseInt(Math.random() * textWords.length)];
    const initials = world.map(w => w.getRemainingWord()[0]);
    if (!initials.includes(cand[0])) {
      word = cand;
      break;
    }
  }

  const x = 0.5 * Math.random() * width + width / 4;

  const min_velocity = 0.55 * height;
  const random_velocity = Math.random() * 0.35 * height;

  const throwAngleLimit = 20;
  const throwAngle = Math.random() * throwAngleLimit - throwAngleLimit / 2;

  const position = new Vec2(x, height + 20);
  const velocity = (new Vec2(0, -1).rotated(throwAngle).mult(min_velocity + random_velocity));

  const onRemoveCallback = function(word) {
    world = world.filter(w => w !== word);
    newWord();
  };

  world.push(new Word(word, position, velocity, onRemoveCallback));
}

function updateOverlay() {
  if (gameRunning) {
    const divScore = document.getElementById('score');
    const divTime = document.getElementById('time');

    const timeLeft = duration - gameElapsed;

    if (timeLeft <= 0) {
      endGame();
      return;
    }

    divScore.innerHTML = 'Score: ' + score;
    divTime.innerHTML = 'Time: ' + timeLeft.toFixed(2);
  }
}

function gameLoop(timestamp) {
  if (gameRunning) {
    updateOverlay();

    newWord();

    const dt = (timestamp - last_timestamp) / 1000;
    gameElapsed += dt;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Read user input

    // Update game state
    for (let word of world) {
      word.update(dt);
    }

    // Render game state
    for (let word of world) {
      word.render(context);
    }

  }
  last_timestamp = timestamp;
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

document.onkeydown = function(e) {
  if (!gameRunning) {
    return;
  }
  const c = e.key;

  if (c == "Backspace") {
    for (let word of world) {
      word.selected = false;
    }
  }

  const selectedWords = world.filter(w => w.selected);
  var selectedWord = null;
  if (selectedWords.length > 0) {
    selectedWord = selectedWords[0];
  } else {
    const words = world.filter(w => w.getRemainingWord().startsWith(c));
    if (words.length > 0) {
      words[0].selected = true;
      selectedWord = words[0];
    }
  }

  if (selectedWord != null && selectedWord != undefined) {
    if (selectedWord.check(c)) {
      score += 1;
    }
  }
}

function endGame() {
  gameRunning = false;
  const lastScore = document.getElementById('lastScore');
  lastScore.innerHTML = 'Last score: ' + score;

  const status = document.getElementById('status');
  status.innerHTML = 'Game over! Press "Start" to play again.';

  startButtonParent.appendChild(startButton);
}

document.startNewGame = function() {
  if (!gameRunning) {
    startButtonParent.removeChild(startButton);
    world = [];
    gameRunning = true;
    gameElapsed = 0;
    score = 0;

    const lastScore = document.getElementById('lastScore');
    lastScore.innerHTML = "";

    const status = document.getElementById('status');
    status.innerHTML = "";
  }
}
