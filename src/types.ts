import type * as THREE from 'three';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import type { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';

// ─── Data layer ───

export interface NodeContent {
  title: string;
  subtitle: string;
  lines: string[];
}

export interface NodeData {
  id: string;
  label: string;
  sublabel: string;
  color: string;
  position: [number, number, number];
  size: number;
  content: NodeContent;
}

export type ConnectionTuple = [string, string];

export interface BootLine {
  time: number;
  text: string;
  append?: string;
  appendDelay?: number;
  color?: string;
}

export interface ProfileData {
  name: string;
  title: string;
  tagline: string;
  location: string;
  current: string;
  email: string;
  linkedin: string;
}

// ─── Module return types ───

export interface SceneSystem {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
}

export interface CameraSystem {
  controls: OrbitControls;
  update(delta: number): void;
  flyTo(
    targetPos: THREE.Vector3,
    lookAt: THREE.Vector3 | null,
    duration: number,
    callback?: (() => void) | null
  ): void;
  isFlying(): boolean;
  enableControls(): void;
  disableControls(): void;
}

export interface NodesSystem {
  nodeMeshes: THREE.Mesh[];
  nodeGroup: THREE.Group;
  labelRenderer: CSS2DRenderer;
  update(time: number): void;
}

export interface ConnectionsSystem {
  connectionGroup: THREE.Group;
  update(delta: number): void;
}

export interface PostFxSystem {
  composer: EffectComposer;
  update(time: number, delta: number): void;
  render(): void;
}

// ─── Shader uniform interfaces ───

export interface NodeShaderUniforms {
  uColor: THREE.IUniform<THREE.Color>;
  uTime: THREE.IUniform<number>;
  uHover: THREE.IUniform<number>;
}

export interface ChromaticAberrationUniforms extends Record<string, THREE.IUniform<unknown>> {
  tDiffuse: THREE.IUniform<THREE.Texture | null>;
  uOffset: THREE.IUniform<number>;
  uTime: THREE.IUniform<number>;
}

export interface CRTUniforms extends Record<string, THREE.IUniform<unknown>> {
  tDiffuse: THREE.IUniform<THREE.Texture | null>;
  uTime: THREE.IUniform<number>;
  uScanlineIntensity: THREE.IUniform<number>;
  uCurvature: THREE.IUniform<number>;
}

export interface FilmGrainUniforms extends Record<string, THREE.IUniform<unknown>> {
  tDiffuse: THREE.IUniform<THREE.Texture | null>;
  uTime: THREE.IUniform<number>;
  uGrainIntensity: THREE.IUniform<number>;
}

// ─── userData shape on node meshes ───

export interface NodeMeshUserData {
  nodeData: NodeData;
  hover: number;
  hoverTarget: number;
  light: THREE.PointLight;
  ring: THREE.Mesh;
  ring2: THREE.Mesh;
}

// ─── camera.ts fly-to state ───

export interface FlyState {
  start: THREE.Vector3;
  target: THREE.Vector3;
  startLookAt: THREE.Vector3;
  lookAt: THREE.Vector3;
  duration: number;
  progress: number;
  callback: (() => void) | null;
}
