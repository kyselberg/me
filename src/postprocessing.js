import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';

// Chromatic Aberration shader
const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    uOffset: { value: 0.003 },
    uTime: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uOffset;
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      float offset = uOffset * (0.8 + 0.2 * sin(uTime * 1.5));
      vec2 dir = vUv - 0.5;
      float dist = length(dir);
      float o = offset * dist;
      float r = texture2D(tDiffuse, vUv + dir * o).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - dir * o).b;
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `,
};

// CRT + Scanline shader
const CRTShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uScanlineIntensity: { value: 0.06 },
    uCurvature: { value: 0.02 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uScanlineIntensity;
    uniform float uCurvature;
    varying vec2 vUv;
    void main() {
      // Barrel distortion
      vec2 uv = vUv - 0.5;
      float r2 = dot(uv, uv);
      uv *= 1.0 + uCurvature * r2;
      uv += 0.5;

      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = vec4(0.0);
        return;
      }

      vec4 color = texture2D(tDiffuse, uv);

      // Scanlines
      float scanline = sin(uv.y * 800.0) * uScanlineIntensity;
      color.rgb -= scanline;

      // Moving beam
      float beam = smoothstep(0.0, 0.005, abs(uv.y - fract(uTime * 0.15)));
      color.rgb += (1.0 - beam) * 0.03;

      // Slight vignette
      float vig = 1.0 - r2 * 1.5;
      color.rgb *= vig;

      gl_FragColor = color;
    }
  `,
};

// Film Grain + Flicker
const FilmGrainShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uGrainIntensity: { value: 0.08 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uGrainIntensity;
    varying vec2 vUv;

    float random(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);

      // Grain
      float grain = random(vUv * uTime) * uGrainIntensity;
      color.rgb += grain - uGrainIntensity * 0.5;

      // Random flicker (very subtle)
      float flicker = 1.0 - step(0.998, random(vec2(uTime * 0.01, 0.0))) * 0.15;
      color.rgb *= flicker;

      gl_FragColor = color;
    }
  `,
};

export function createPostProcessing(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);

  // Base render
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // Bloom — aggressive
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    2.0,   // strength
    0.8,   // radius
    0.1    // threshold
  );
  composer.addPass(bloomPass);

  // Chromatic aberration
  const chromaticPass = new ShaderPass(ChromaticAberrationShader);
  composer.addPass(chromaticPass);

  // CRT scanlines
  const crtPass = new ShaderPass(CRTShader);
  composer.addPass(crtPass);

  // Glitch — we control when it fires
  const glitchPass = new GlitchPass();
  glitchPass.goWild = false;
  glitchPass.enabled = false;
  composer.addPass(glitchPass);

  // Film grain
  const grainPass = new ShaderPass(FilmGrainShader);
  composer.addPass(grainPass);

  // Glitch burst timer
  let glitchTimer = 5 + Math.random() * 5;

  function update(time, delta) {
    chromaticPass.uniforms.uTime.value = time;
    crtPass.uniforms.uTime.value = time;
    grainPass.uniforms.uTime.value = time;

    // Random glitch bursts
    glitchTimer -= delta;
    if (glitchTimer <= 0) {
      glitchPass.enabled = true;
      setTimeout(() => {
        glitchPass.enabled = false;
      }, 150 + Math.random() * 200);
      glitchTimer = 5 + Math.random() * 8;
    }
  }

  function render() {
    composer.render();
  }

  // Handle resize
  window.addEventListener('resize', () => {
    composer.setSize(window.innerWidth, window.innerHeight);
    bloomPass.resolution.set(window.innerWidth, window.innerHeight);
  });

  return { composer, update, render, bloomPass, chromaticPass };
}
