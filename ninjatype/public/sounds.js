var sound_profile = 'mx-brown';

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const cache = {
};

let sounds = [
];

let lastSoundUsed = 0;

function getProfile() {
  return sound_profile == 'default' ? 'mx-brown' : sound_profile;
}

const profiles = [
  {
    name: "mx-brown", keySounds: [
      // "press_back.mp3",
      // "press_enter.mp3",
      "press_key1.mp3",
      "press_key2.mp3",
      "press_key3.mp3",
      "press_key4.mp3",
      "press_key5.mp3",
      // "press_space.mp3",
      // "profile.yaml",
      // "release_back.mp3",
      // "release_enter.mp3",
      // "release_key.mp3",
      // "release_space.mp3",
    ],
  },
  {
    name: "mx-black", keySounds: [
      // "press_back.mp3",
      // "press_enter.mp3",
      "press_key1.mp3",
      "press_key2.mp3",
      "press_key3.mp3",
      "press_key4.mp3",
      "press_key5.mp3",
      // "press_space.mp3",
      // "profile.yaml",
      // "release_back.mp3",
      // "release_enter.mp3",
      // "release_key.mp3",
      // "release_space.mp3",
    ],
  },
  {
    name: "mx-blue", keySounds: [
      "press_key1.mp3",
      "press_key2.mp3",
      "press_key3.mp3",
      "press_key4.mp3",
      "press_key5.mp3",
      // "profile.yaml",
      // "release.mp3",
    ],
  },
  {
    name: "gateron-black-ink", keySounds: [
      // "press_back.mp3",
      // "press_enter.mp3",
      "press_key1.mp3",
      "press_key2.mp3",
      "press_key3.mp3",
      "press_key4.mp3",
      "press_key5.mp3",
      // "press_space.mp3",
      // "profile.yaml",
      // "release_back.mp3",
      // "release_enter.mp3",
      // "release_key.mp3",
      // "release_space.mp3",
    ],
  },
  {
    name: "typewriter", keySounds: [
      "key.wav",
      "key2.wav",
      // "profile.yaml",
      "space.wav",
    ],
  },
  {
    name: 'muted', keySounds: [],
  },
];

function updateSoundProfile() {
  const sp = getProfile();
  const i = profiles.findIndex(p => p.name == sp);
  sound_profile = profiles[(i + 1) % profiles.length].name;
}

async function _getAudioSource(audioBuffer) {
  const audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  audioSource.connect(audioContext.destination);
  audioSource.loop = false;

  return audioSource;
}

async function getAudioSource(src) {
  if (cache[src]) {
    return _getAudioSource(cache[src]);
  }

  const response = await fetch(src);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  cache[src] = audioBuffer;

  return _getAudioSource(audioBuffer);
}

async function playSound() {
  if (sounds.length == 0) {
    return;
  }

  const src = sounds[lastSoundUsed++ % sounds.length];
  const audioSource = await getAudioSource(src);

  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  audioSource.start(0);
}

async function loadSounds() {
  sounds = [];
  const sources = [];
  const sp = getProfile();
  const profile = profiles.find(p => p.name == sp);
  for (const keySound of profile.keySounds) {
    const src = `misc/sounds/${sp}/${keySound}`;
    const audioSource = await getAudioSource(src);
    sources.push(audioSource);
    sounds.push(src);
  }

  if (sounds.length == 0) {
    return;
  }

  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  sources[0].start(0);
}

export { sound_profile, updateSoundProfile, playSound, getProfile, loadSounds };
