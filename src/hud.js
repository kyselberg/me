const hud = document.getElementById('hud');
const fpsEl = document.getElementById('hud-fps');
const discoveredEl = document.getElementById('hud-discovered');
const audioEl = document.getElementById('hud-audio');

const discovered = new Set();
let lastFpsUpdate = 0;
let frameCount = 0;

export function showHud() {
  hud.classList.remove('hidden');
}

export function hideHud() {
  hud.classList.add('hidden');
}

export function discoverNode(nodeId) {
  discovered.add(nodeId);
  discoveredEl.textContent = `NODES_DISCOVERED: ${discovered.size}/6`;
}

export function updateFps(time) {
  frameCount++;
  if (time - lastFpsUpdate >= 1) {
    fpsEl.textContent = `> FPS: ${frameCount}`;
    frameCount = 0;
    lastFpsUpdate = time;
  }
}

export function setAudioState(on) {
  audioEl.textContent = on ? '\u{1F50A} AUDIO: ON' : '\u{1F507} AUDIO: OFF';
}
