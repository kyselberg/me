import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { NODES } from './data.js';

// Inline shaders to avoid fetch issues
const VERT = `
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAG = `
uniform vec3 uColor;
uniform float uTime;
uniform float uHover;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
void main() {
  vec3 viewDir = normalize(-vPosition);
  float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.5);
  float pulse = 0.7 + 0.3 * sin(uTime * 2.0);
  float core = 0.3 * exp(-2.0 * length(vUv - 0.5));
  float intensity = (fresnel * 0.8 + core + 0.15) * pulse;
  intensity += uHover * 0.5;
  vec3 color = uColor * intensity;
  float lines = 0.5 + 0.5 * sin(vUv.y * 40.0 + uTime * 3.0);
  color += uColor * lines * 0.05;
  gl_FragColor = vec4(color, 0.85 + fresnel * 0.15);
}`;

export function createNodes(scene) {
  const nodeMeshes = [];
  const nodeGroup = new THREE.Group();

  // CSS2D renderer for labels
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'fixed';
  labelRenderer.domElement.style.top = '0';
  labelRenderer.domElement.style.left = '0';
  labelRenderer.domElement.style.pointerEvents = 'none';
  labelRenderer.domElement.style.zIndex = '5';
  document.body.appendChild(labelRenderer.domElement);

  window.addEventListener('resize', () => {
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
  });

  const sphereGeo = new THREE.SphereGeometry(1, 32, 32);

  NODES.forEach((data) => {
    const color = new THREE.Color(data.color);

    // Main sphere with custom shader
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uColor: { value: color },
        uTime: { value: 0 },
        uHover: { value: 0 },
      },
      transparent: true,
      side: THREE.FrontSide,
    });

    const mesh = new THREE.Mesh(sphereGeo, material);
    mesh.scale.setScalar(data.size);
    mesh.position.set(...data.position);
    mesh.userData = { nodeData: data, hover: 0 };
    nodeGroup.add(mesh);

    // Point light per node
    const light = new THREE.PointLight(color, 2, 15);
    light.position.copy(mesh.position);
    nodeGroup.add(light);
    mesh.userData.light = light;

    // Orbiting ring
    const ringGeo = new THREE.TorusGeometry(data.size * 1.6, 0.02, 8, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: data.color,
      transparent: true,
      opacity: 0.25,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(mesh.position);
    ring.rotation.x = Math.PI * 0.35;
    nodeGroup.add(ring);
    mesh.userData.ring = ring;

    // Second ring (perpendicular)
    const ring2Geo = new THREE.TorusGeometry(data.size * 1.9, 0.015, 8, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: data.color,
      transparent: true,
      opacity: 0.12,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.position.copy(mesh.position);
    ring2.rotation.x = Math.PI * 0.7;
    ring2.rotation.y = Math.PI * 0.3;
    nodeGroup.add(ring2);
    mesh.userData.ring2 = ring2;

    // CSS2D label
    const labelDiv = document.createElement('div');
    labelDiv.className = 'node-label';
    labelDiv.style.color = data.color;

    const mainSpan = document.createElement('span');
    mainSpan.className = 'label-main';
    mainSpan.textContent = data.label;

    const subSpan = document.createElement('span');
    subSpan.className = 'label-sub';
    subSpan.textContent = data.sublabel;

    labelDiv.appendChild(mainSpan);
    labelDiv.appendChild(subSpan);

    const label = new CSS2DObject(labelDiv);
    label.position.set(0, -(data.size + 0.8), 0);
    mesh.add(label);

    nodeMeshes.push(mesh);
  });

  scene.add(nodeGroup);

  function update(time) {
    nodeMeshes.forEach((mesh) => {
      const mat = mesh.material;
      mat.uniforms.uTime.value = time;

      // Smooth hover interpolation
      const target = mesh.userData.hoverTarget || 0;
      mesh.userData.hover += (target - mesh.userData.hover) * 0.1;
      mat.uniforms.uHover.value = mesh.userData.hover;

      // Rotate rings
      const ring = mesh.userData.ring;
      const ring2 = mesh.userData.ring2;
      if (ring) ring.rotation.z += 0.003;
      if (ring2) ring2.rotation.z -= 0.002;

      // Slight float
      mesh.position.y = mesh.userData.nodeData.position[1] + Math.sin(time * 0.8 + mesh.id) * 0.15;
    });
  }

  return { nodeMeshes, nodeGroup, labelRenderer, update };
}
