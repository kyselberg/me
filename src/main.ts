import * as THREE from 'three';
import { createScene } from './scene.js';
import { createControls } from './camera.js';
import { createNodes } from './nodes.js';
import { createConnections } from './connections.js';
import { createPostProcessing } from './postprocessing.js';
import { runBootSequence } from './boot.js';
import { openPanel, closePanel as _closePanel, isPanelOpen } from './panels.js';
import { showHud, discoverNode, updateFps, setAudioState } from './hud.js';
import { initAudio, playHover, playClick, toggleMute } from './audio.js';
import type { NodeMeshUserData } from './types.js';

// ─── State ───
let running = false;
let hoveredNode: THREE.Mesh | null = null;
let audioInitialized = false;
const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const HOME_POS = new THREE.Vector3(0, 2, 20);
const HOME_LOOK = new THREE.Vector3(0, 0, 0);

// ─── Init ───
const canvas = document.getElementById('scene-canvas') as HTMLCanvasElement;
const { renderer, scene, camera } = createScene(canvas);
const cameraCtrl = createControls(camera, canvas);
const nodesSystem = createNodes(scene);
const connectionsSystem = createConnections(scene);
const postFx = createPostProcessing(renderer, scene, camera);

// ─── Ambient particles (floating debris) ───
const debrisCount = 500;
const debrisGeo = new THREE.BufferGeometry();
const debrisPositions = new Float32Array(debrisCount * 3);
for (let i = 0; i < debrisCount; i++) {
  debrisPositions[i * 3] = (Math.random() - 0.5) * 60;
  debrisPositions[i * 3 + 1] = (Math.random() - 0.5) * 40;
  debrisPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
}
debrisGeo.setAttribute('position', new THREE.BufferAttribute(debrisPositions, 3));
const debrisMat = new THREE.PointsMaterial({
  color: '#00ff88',
  size: 0.04,
  transparent: true,
  opacity: 0.4,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const debris = new THREE.Points(debrisGeo, debrisMat);
scene.add(debris);

// ─── Data rain particles ───
const rainCount = 800;
const rainGeo = new THREE.BufferGeometry();
const rainPositions = new Float32Array(rainCount * 3);
const rainSpeeds = new Float32Array(rainCount);
for (let i = 0; i < rainCount; i++) {
  rainPositions[i * 3] = (Math.random() - 0.5) * 50;
  rainPositions[i * 3 + 1] = Math.random() * 30 - 15;
  rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 50;
  rainSpeeds[i] = 2 + Math.random() * 4;
}
rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
const rainMat = new THREE.PointsMaterial({
  color: '#00ff88',
  size: 0.03,
  transparent: true,
  opacity: 0.2,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const rain = new THREE.Points(rainGeo, rainMat);
scene.add(rain);

// ─── Init audio on first interaction ───
function ensureAudio(): void {
  if (!audioInitialized) {
    audioInitialized = true;
    initAudio();
  }
}

// ─── Boot → Intro → Loop ───
async function start(): Promise<void> {
  await runBootSequence();

  // Position camera for fly-through
  camera.position.set(0, 5, 40);
  camera.lookAt(0, 0, 0);

  running = true;
  showHud();

  // Intro fly-through then hand control to user (auto-rotate kicks in)
  cameraCtrl.flyTo(HOME_POS, HOME_LOOK, 3, () => {
    cameraCtrl.controls.autoRotate = true;
  });

  animate();
}

// ─── Track mouse for hover raycasting ───
canvas.addEventListener('mousemove', (e: MouseEvent) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// ─── Raycast for node hover ───
function updateRaycast(): void {
  if (isPanelOpen() || cameraCtrl.isFlying()) return;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(nodesSystem.nodeMeshes);

  // Reset previous hover
  if (hoveredNode) {
    (hoveredNode.userData as NodeMeshUserData).hoverTarget = 0;
  }

  if (intersects.length > 0) {
    const hit = intersects[0].object as THREE.Mesh;
    if (hit !== hoveredNode) {
      hoveredNode = hit;
      ensureAudio();
      playHover();
    }
    (hit.userData as NodeMeshUserData).hoverTarget = 1;
    canvas.style.cursor = 'pointer';
  } else {
    if (hoveredNode) {
      hoveredNode = null;
      canvas.style.cursor = 'grab';
    }
  }
}

// ─── Click to inspect node ───
canvas.addEventListener('click', (e: MouseEvent) => {
  ensureAudio();

  if (isPanelOpen() || cameraCtrl.isFlying()) return;

  // Raycast from click position
  const clickMouse = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(clickMouse, camera);
  const intersects = raycaster.intersectObjects(nodesSystem.nodeMeshes);

  if (intersects.length === 0) return;

  const node = intersects[0].object as THREE.Mesh;
  const data = (node.userData as NodeMeshUserData).nodeData;

  playClick();
  discoverNode(data.id);

  // Stop auto-rotate during inspection
  cameraCtrl.controls.autoRotate = false;

  // Fly to node
  const nodePos = node.position.clone();
  const offset = camera.position.clone().sub(nodePos).normalize().multiplyScalar(data.size * 3.5);
  const targetPos = nodePos.clone().add(offset);

  cameraCtrl.flyTo(targetPos, nodePos, 1.2, () => {
    openPanel(data.content, () => {
      // On panel close, fly back home and resume auto-rotate
      cameraCtrl.flyTo(HOME_POS, HOME_LOOK, 1.0, () => {
        cameraCtrl.controls.autoRotate = true;
      });
    });
  });
});

// ─── Audio toggle ───
document.getElementById('hud-audio')!.addEventListener('click', () => {
  ensureAudio();
  const on = toggleMute();
  setAudioState(on);
});

// ─── Update data rain ───
function updateRain(delta: number): void {
  const pos = rain.geometry.attributes['position'].array as Float32Array;
  for (let i = 0; i < rainCount; i++) {
    pos[i * 3 + 1] -= rainSpeeds[i] * delta;
    if (pos[i * 3 + 1] < -15) {
      pos[i * 3 + 1] = 15;
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
  }
  rain.geometry.attributes['position'].needsUpdate = true;
}

// ─── Render loop ───
function animate(): void {
  if (!running) return;
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  // Update systems
  cameraCtrl.update(delta);
  nodesSystem.update(elapsed);
  connectionsSystem.update(delta);
  postFx.update(elapsed, delta);
  updateRaycast();
  updateRain(delta);
  updateFps(elapsed);

  // Rotate debris slowly
  debris.rotation.y += 0.0002;

  // Render with post-processing
  postFx.render();

  // Render CSS2D labels
  nodesSystem.labelRenderer.render(scene, camera);
}

// ─── Go ───
start();
