// ============================================================
// sounds.js — Sound loading and playback helpers
// Depends on: globals.js
// ============================================================

const shootingSoundSrc = './Sounds/shoot_sound.mp3';

function preloadSound(src) {
    const sound = new Audio(src);
    sound.load();
    return sound;
}

preloadSound(shootingSoundSrc);