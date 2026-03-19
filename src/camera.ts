import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { CameraSystem, FlyState } from './types.js';

export function createControls(
  camera: THREE.PerspectiveCamera,
  canvas: HTMLCanvasElement
): CameraSystem {
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.rotateSpeed = 0.5;
  controls.zoomSpeed = 0.8;
  controls.minDistance = 5;
  controls.maxDistance = 40;
  controls.target.set(0, 0, 0);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.3;

  let flyState: FlyState | null = null;
  let flying = false;

  function flyTo(
    targetPos: THREE.Vector3,
    lookAt: THREE.Vector3 | null,
    duration: number,
    callback?: (() => void) | null
  ): void {
    flyState = {
      start: camera.position.clone(),
      startLookAt: controls.target.clone(),
      target: targetPos.clone(),
      lookAt: lookAt ? lookAt.clone() : controls.target.clone(),
      duration: duration || 1.5,
      progress: 0,
      callback: callback ?? null,
    };
    flying = true;
    controls.enabled = false;
  }

  function isFlying(): boolean {
    return flying;
  }

  function enableControls(): void {
    controls.enabled = true;
  }

  function disableControls(): void {
    controls.enabled = false;
  }

  function update(delta: number): void {
    if (flying && flyState) {
      flyState.progress += delta / flyState.duration;
      if (flyState.progress >= 1) {
        flyState.progress = 1;
        camera.position.copy(flyState.target);
        controls.target.copy(flyState.lookAt);
        flying = false;
        controls.enabled = true;
        const cb = flyState.callback;
        flyState = null;
        if (cb) cb();
      } else {
        const t = easeInOutCubic(flyState.progress);
        camera.position.lerpVectors(flyState.start, flyState.target, t);
        controls.target.lerpVectors(flyState.startLookAt, flyState.lookAt, t);
      }
    }

    controls.update();
  }

  return { controls, update, flyTo, isFlying, enableControls, disableControls };
}

function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
