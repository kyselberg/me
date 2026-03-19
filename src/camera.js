import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createControls(camera, canvas) {
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

  // Fly-to state
  let flyTarget = null;
  let flyStart = null;
  let flyProgress = 0;
  let flyCallback = null;
  let flyLookAt = null;
  let flyStartLookAt = null;
  let flying = false;

  function flyTo(targetPos, lookAt, duration, callback) {
    flyStart = camera.position.clone();
    flyStartLookAt = controls.target.clone();
    flyTarget = targetPos.clone();
    flyLookAt = lookAt ? lookAt.clone() : controls.target.clone();
    flyProgress = 0;
    flyCallback = callback || null;
    flyTarget._duration = duration || 1.5;
    flying = true;
    controls.enabled = false;
  }

  function isFlying() {
    return flying;
  }

  function enableControls() {
    controls.enabled = true;
  }

  function disableControls() {
    controls.enabled = false;
  }

  function update(delta) {
    // Handle fly-to animation
    if (flying && flyTarget) {
      flyProgress += delta / (flyTarget._duration || 1.5);
      if (flyProgress >= 1) {
        flyProgress = 1;
        camera.position.copy(flyTarget);
        controls.target.copy(flyLookAt);
        flying = false;
        controls.enabled = true;
        const cb = flyCallback;
        flyTarget = null;
        flyCallback = null;
        if (cb) cb();
      } else {
        const t = easeInOutCubic(flyProgress);
        camera.position.lerpVectors(flyStart, flyTarget, t);
        controls.target.lerpVectors(flyStartLookAt, flyLookAt, t);
      }
    }

    controls.update();
  }

  return { controls, update, flyTo, isFlying, enableControls, disableControls };
}

function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
