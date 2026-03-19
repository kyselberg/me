uniform vec3 uColor;
uniform float uTime;
uniform float uHover;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  // Fresnel rim glow
  vec3 viewDir = normalize(-vPosition);
  float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.5);

  // Pulsing inner glow
  float pulse = 0.7 + 0.3 * sin(uTime * 2.0);

  // Core glow (center brighter)
  float core = 0.3 * exp(-2.0 * length(vUv - 0.5));

  // Combine
  float intensity = (fresnel * 0.8 + core + 0.15) * pulse;
  intensity += uHover * 0.5;

  vec3 color = uColor * intensity;

  // Add slight inner pattern
  float lines = 0.5 + 0.5 * sin(vUv.y * 40.0 + uTime * 3.0);
  color += uColor * lines * 0.05;

  gl_FragColor = vec4(color, 0.85 + fresnel * 0.15);
}
