# Neural Network Landing Page — Design Spec

## Overview

A full-screen, game-like 3D personal landing page for **Illia Kyselov** (Frontend Engineer). The site presents career data as an interactive neural network: glowing nodes floating in 3D space, connected by pulsing energy streams. Users navigate freely with WASD + mouse, clicking nodes to expand holographic content panels.

The aesthetic is **acid-neon cyberpunk** — aggressive bloom, chromatic aberration, CRT scanlines, glitch bursts, data rain, and a fake boot sequence. The goal: make every recruiter and developer who visits say "what the hell" and then spend 5 minutes exploring.

**Audience:** Recruiters, hiring managers, and the broader dev community.
**Purpose:** Dual — recruiter-ready portfolio AND creative technical showcase.

---

## Tech Stack

- **HTML + CSS + vanilla JS** — no framework
- **Three.js** — 3D scene, camera, controls, lighting, geometry
- **Custom GLSL shaders** — neon glow, energy flow, data rain, CRT effects
- **Three.js post-processing** — UnrealBloom, chromatic aberration, film grain, glitch pass
- **Web Audio API** — ambient synth hum, hover/click SFX
- No build tools required (can optionally use Vite for dev server)

---

## Content Data (Enhanced CV)

### CORE NODE — Identity
- **Name:** Illia Kyselov
- **Title:** Frontend Engineer / Creative Technologist
- **Location:** Kyiv, Ukraine
- **Tagline:** "I build interfaces that feel alive."
- **Current:** Frontend Engineer @ Universe Group (Genesis Tech)
- **Education:** Master's in CS @ Kyiv-Mohyla Academy (in progress)

### NODE: Experience (4 sub-nodes)

**Universe Group** (Nov 2025 — Present)
- Genesis Tech ecosystem, high-scale products, millions of users

**SubSub** (Jul 2024 — Nov 2025) — "The One-Man Frontend Army"
- Sole frontend engineer, built Nuxt apps from zero to production
- Migrated legacy Laravel monolith → modular Vue architecture
- Introduced testing culture (unit, component tests)
- Led frontend hiring: designed tech assessments, ran interviews
- Zero production crashes across entire tenure

**Nimble CRM** (Dec 2020 — Jul 2024) — "From Junior to Architect"
- 3.5 years of growth: junior → mid-level → technical leader
- Led deep refactor: 2-5 bugs/month → virtually zero
- Introduced comprehensive testing (unit, component, E2E)
- Championed React modernization

### NODE: Tech Arsenal
- **Frontend:** Vue, Nuxt, React, TypeScript, Tailwind CSS
- **Testing:** Vitest, Jest, Cypress, Testing Library
- **Backend:** Laravel, Node.js, Python, Go
- **Infra:** Cloudflare, Vite, Webpack
- **Creative:** Three.js, WebGL, GLSL Shaders

### NODE: Education
- Master's — CS, Kyiv-Mohyla Academy (2025-2027)
- Bachelor's — System Analysis, Kyiv National Economics University (2021-2025)

### NODE: Philosophy
- "I don't chase hype. I choose tools like I choose battles — carefully."
- Architecture-first, zero-ego, ship fast, don't break things

### NODE: Contact
- Email: doncerber@gmail.com
- LinkedIn: linkedin.com/in/illiakyselov

---

## 3D Scene Architecture

### Scene Graph

```
Scene
├── Camera (PerspectiveCamera + PointerLockControls)
├── Ambient Light (very dim, #0a0a1a)
├── Point Lights (one per node, matching node color)
├── Neural Network Group
│   ├── Core Node (Illia identity, largest sphere)
│   ├── Experience Node (with 4 child sub-nodes orbiting it)
│   ├── Tech Arsenal Node
│   ├── Education Node
│   ├── Philosophy Node
│   └── Contact Node
├── Connections Group
│   ├── Line geometries between related nodes
│   └── Particle systems flowing along each line
├── Environment
│   ├── Data Rain particle system (Matrix-style falling characters)
│   ├── Background nebula (shader-generated)
│   └── Floating debris particles
├── HUD Overlay (HTML/CSS, positioned over canvas)
│   ├── Top-left: system stats
│   ├── Top-right: title/status
│   ├── Bottom-left: controls
│   └── Bottom-right: discovery tracker
└── Post-Processing
    ├── UnrealBloomPass (strength: 2.0, threshold: 0.1, radius: 0.8)
    ├── GlitchPass (random bursts every 5-10s)
    ├── ShaderPass: chromatic aberration
    ├── ShaderPass: CRT scanlines + curvature
    ├── ShaderPass: film grain / VHS noise
    └── ShaderPass: screen flicker
```

### Node Design
Each node is a **glowing sphere** with:
- Custom shader: inner glow + pulsing brightness + fresnel rim
- Orbiting dashed ring (like an electron orbit)
- Floating label text (Three.js sprite or CSS2DRenderer)
- Unique color per category (see palette below)
- On hover: bloom intensifies 3x, slight glitch effect, hover SFX
- On click: camera smoothly flies to node, node "opens" — sphere splits/dissolves, reveals a holographic content panel (HTML overlay or CSS2D)

### Connections
- Line geometries between related nodes (BufferGeometry + LineBasicMaterial)
- Particle system flowing along each connection (custom shader, GPU-driven)
- Particle speed increases when user is near
- Connection opacity based on distance to camera

### Content Panels (when node is clicked)
- Holographic-styled HTML overlay (semi-transparent dark background, neon borders)
- Text typed out character-by-character (typewriter effect)
- Scanline overlay on the panel itself
- Close button or ESC to return to overview (camera flies back out)

---

## User Experience Flow

### 1. Boot Sequence (0-4 seconds)
Full-screen black terminal, green monospace text types out line by line:
```
[0.00s] > BIOS CHECK... OK
[0.30s] > GPU INITIALIZED: WebGL 2.0
[0.50s] > LOADING NEURAL_MAP.dat... ████████░░░░ 67%
[1.00s] > WARNING: UNAUTHORIZED ACCESS DETECTED
[1.20s] > OVERRIDE: GRANTED
[1.50s] > DECRYPTING PROFILE... ████████████ 100%
[2.00s] > SUBJECT: ILLIA KYSELOV
[2.20s] > CLASS: FRONTEND_ENGINEER
[2.50s] > THREAT_ASSESSMENT: EXTREMELY DANGEROUS
[3.00s] > ENTERING NEURAL INTERFACE...
[3.50s] > ▶ ▶ ▶
```
Screen glitches hard, then smash-cuts to the 3D scene.

### 2. Intro Camera Fly-Through (4-7 seconds)
- Camera starts far away, zooms through the neural network
- Passes close to each node (nodes light up as camera passes)
- Ends at a "home position" — centered, all nodes visible
- HUD fades in

### 3. Free Exploration
- WASD to move in 3D space (invisible sphere boundary ~2x the neural network radius)
- Mouse to freelook (pointer lock on click)
- Shift for speed boost
- Nodes react to proximity (glow intensifies, subtle pull)
- Click any node to zoom in and expand content

### 4. Node Inspection
- Camera smoothly interpolates to node position
- Node sphere dissolves/splits apart
- Holographic content panel materializes with typewriter text
- ESC or back button returns to free roam

### 5. Mobile Fallback
- Touch controls: drag to look, tap nodes to explore
- Gyroscope camera control (optional)
- Simplified post-processing (no glitch/chromatic on low-end)
- Auto-orbit mode as fallback for non-interactive viewing

---

## Visual Effects Detail

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Neon Green | `#00FF88` | Core node, primary text, system HUD |
| Electric Blue | `#00CCFF` | Experience node, secondary accents |
| Acid Purple | `#CC44FF` | Tech Arsenal node, glitch accents |
| Hot Pink | `#FF0088` | Education node, warnings, errors |
| Cyber Yellow | `#FFCC00` | Philosophy node, highlights |
| Cyan | `#00FFFF` | Contact node |
| Void Black | `#050510` | Background, scene fog |

### Post-Processing Stack
1. **UnrealBloom** — strength 2.0+, threshold 0.1, radius 0.8. Everything bleeds neon.
2. **Chromatic Aberration** — RGB channel offset (2-4px). Intensifies on transitions.
3. **CRT Scanlines** — horizontal line overlay + moving beam sweep + barrel distortion.
4. **Glitch Pass** — random screen tears every 5-10s. Horizontal slice offset + color inversion + static noise.
5. **Film Grain** — subtle animated noise texture. VHS tracking line artifact.
6. **Screen Flicker** — random brightness drops for 1-2 frames.

### Audio
- Ambient: low synth drone/hum (loop, subtle)
- Node hover: soft electric buzz
- Node click: digital "access" beep
- Boot sequence: keyboard clack typing sounds
- Camera movement: faint whoosh
- Toggle: mute button in HUD corner

---

## File Structure

```
/
├── index.html              # Entry point, boot sequence, HUD overlay
├── style.css               # HUD styles, content panel styles, boot screen
├── src/
│   ├── main.js             # Entry point, scene init, render loop
│   ├── scene.js            # Three.js scene setup, lights, fog
│   ├── camera.js           # Camera, pointer lock controls, fly-through
│   ├── nodes.js            # Node creation, materials, interactions
│   ├── connections.js      # Line geometries, particle flow
│   ├── postprocessing.js   # Bloom, glitch, chromatic, CRT, grain
│   ├── boot.js             # Boot sequence animation
│   ├── hud.js              # HUD overlay management
│   ├── panels.js           # Content panel display/animation
│   ├── audio.js            # Web Audio API, sound effects
│   ├── data.js             # All CV content data
│   └── shaders/
│       ├── node.vert       # Node vertex shader
│       ├── node.frag       # Node fragment shader (glow + fresnel)
│       ├── connection.frag # Energy flow particle shader
│       ├── datarain.frag   # Matrix data rain shader
│       ├── crt.frag        # CRT scanline + barrel distortion
│       └── chromatic.frag  # Chromatic aberration
├── assets/
│   └── audio/              # Generated/sourced during implementation
│       ├── ambient.mp3     # (use free sci-fi SFX packs or generate with Web Audio)
│       ├── hover.mp3
│       ├── click.mp3
│       └── boot-type.mp3
└── README.md
```

---

## Performance Considerations

- **LOD (Level of Detail):** Reduce node geometry complexity when far from camera
- **Frustum culling:** Three.js handles this, but ensure particle systems respect it
- **Post-processing toggle:** Provide a "performance mode" that disables heavy shaders
- **Mobile detection:** Auto-reduce bloom strength, disable glitch/chromatic, lower particle count
- **Target:** 60fps on mid-range desktop, 30fps on mobile
- **Loading:** Show boot sequence while assets load (double purpose)

---

## Verification Plan

1. **Boot sequence:** Page loads → terminal animation plays → transitions to 3D scene
2. **3D scene:** All 6 nodes visible, glowing, pulsing. Connections between them with flowing particles
3. **Navigation:** WASD movement works, mouse freelook works, shift boost works
4. **Node interaction:** Click any node → camera flies in → content panel appears with typewriter text → ESC returns
5. **Effects:** Bloom visible on all glowing elements, glitch bursts occur periodically, scanlines visible, chromatic aberration on text
6. **Audio:** Ambient drone plays, hover/click sounds work, mute toggle works
7. **Mobile:** Touch controls work, simplified effects, content is readable
8. **Performance:** 60fps on Chrome desktop, no memory leaks after 5 minutes of exploration
