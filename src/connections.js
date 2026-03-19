import * as THREE from 'three';
import { CONNECTIONS, NODES } from './data.js';

const PARTICLES_PER_CONNECTION = 30;

export function createConnections(scene) {
  const connectionGroup = new THREE.Group();
  const particleSystems = [];

  // Build position lookup
  const posMap = {};
  NODES.forEach((n) => {
    posMap[n.id] = new THREE.Vector3(...n.position);
  });
  const colorMap = {};
  NODES.forEach((n) => {
    colorMap[n.id] = new THREE.Color(n.color);
  });

  CONNECTIONS.forEach(([fromId, toId]) => {
    const from = posMap[fromId];
    const to = posMap[toId];
    if (!from || !to) return;

    const c1 = colorMap[fromId];
    const c2 = colorMap[toId];

    // Line
    const points = [from, to];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({
      color: c1.clone().lerp(c2, 0.5),
      transparent: true,
      opacity: 0.12,
    });
    const line = new THREE.Line(lineGeo, lineMat);
    connectionGroup.add(line);

    // Particles flowing along the connection
    const positions = new Float32Array(PARTICLES_PER_CONNECTION * 3);
    const offsets = new Float32Array(PARTICLES_PER_CONNECTION);
    const speeds = new Float32Array(PARTICLES_PER_CONNECTION);

    for (let i = 0; i < PARTICLES_PER_CONNECTION; i++) {
      offsets[i] = Math.random();
      speeds[i] = 0.15 + Math.random() * 0.2;

      const t = offsets[i];
      positions[i * 3] = from.x + (to.x - from.x) * t;
      positions[i * 3 + 1] = from.y + (to.y - from.y) * t;
      positions[i * 3 + 2] = from.z + (to.z - from.z) * t;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: c1.clone().lerp(c2, 0.5),
      size: 0.08,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    connectionGroup.add(particles);

    particleSystems.push({
      particles,
      from,
      to,
      offsets,
      speeds,
    });
  });

  scene.add(connectionGroup);

  function update(delta) {
    particleSystems.forEach((sys) => {
      const pos = sys.particles.geometry.attributes.position.array;
      for (let i = 0; i < PARTICLES_PER_CONNECTION; i++) {
        sys.offsets[i] += sys.speeds[i] * delta;
        if (sys.offsets[i] > 1) sys.offsets[i] -= 1;

        const t = sys.offsets[i];
        pos[i * 3] = sys.from.x + (sys.to.x - sys.from.x) * t;
        pos[i * 3 + 1] = sys.from.y + (sys.to.y - sys.from.y) * t;
        pos[i * 3 + 2] = sys.from.z + (sys.to.z - sys.from.z) * t;
      }
      sys.particles.geometry.attributes.position.needsUpdate = true;
    });
  }

  return { connectionGroup, update };
}
