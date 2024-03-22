var sound_profile = 'default';

let sounds = [
];

let lastSoundUsed = 0;

function getProfile() {
  return sound_profile == 'default' ? 'mx-brown' : sound_profile;
}

const profiles = [
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
    name: "typewriter", keySounds: [
      // "enter.wav",
      "key.wav",
      "key2.wav",
      // "profile.yaml",
      // "space.wav",
    ],
  },
];

function updateSoundProfile() {
  const sp = getProfile();
  const i = profiles.findIndex(p => p.name == sp);
  sound_profile = profiles[(i + 1) % profiles.length].name;
}

function playSound() {
  const audio = sounds[lastSoundUsed++ % sounds.length];
  audio.currentTime = audio.duration * 0.2;
  audio.play();
}

function loadSounds() {
  sounds = [];
  const sp = getProfile();
  const profile = profiles.find(p => p.name == sp);
  for (const keySound of profile.keySounds) {
    const audio = new Audio(`misc/sounds/${sp}/${keySound}`);
    sounds.push(audio);
  }
}

export { sound_profile, updateSoundProfile, playSound, getProfile, loadSounds };
