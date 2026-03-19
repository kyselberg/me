const hud = document.getElementById('hud') as HTMLElement;
const fpsEl = document.getElementById('hud-fps') as HTMLElement;
const discoveredEl = document.getElementById('hud-discovered') as HTMLElement;
const audioEl = document.getElementById('hud-audio') as HTMLElement;

const discovered = new Set<string>();
let lastFpsUpdate = 0;
let frameCount = 0;

export function showHud(): void {
  hud.classList.remove('hidden');
}

export function hideHud(): void {
  hud.classList.add('hidden');
}

export function discoverNode(nodeId: string): void {
  discovered.add(nodeId);
  discoveredEl.textContent = `NODES_DISCOVERED: ${discovered.size}/6`;
}

export function updateFps(time: number): void {
  frameCount++;
  if (time - lastFpsUpdate >= 1) {
    fpsEl.textContent = `> FPS: ${frameCount}`;
    frameCount = 0;
    lastFpsUpdate = time;
  }
}

export function setAudioState(on: boolean): void {
  audioEl.textContent = on ? '\u{1F50A} AUDIO: ON' : '\u{1F507} AUDIO: OFF';
}
