import Word from './word.js';
import Vec2 from './vec2.js';

const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

var last_timestamp = 0;
var world = [];
var textWords = ["alan", "assis", "jose", "lucas", "marcos", "pedro", "rafael", "rodrigo", "victor"];
var wordIndex = 0;

function newWord() {
  if (world.length > 3) {
    return;
  }

  const width = canvas.width;
  const height = canvas.height;


  const word = textWords[wordIndex++ % textWords.length];
  wordIndex += 1;

  const x = Math.random() * width;
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

function gameLoop(timestamp) {
  newWord();

  const dt = (timestamp - last_timestamp) / 1000;

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

  last_timestamp = timestamp;
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

document.onkeydown = function(e) {
  const c = e.key;
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
    selectedWord.check(c);
  }
}
