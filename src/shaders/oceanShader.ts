import * as THREE from "three";

export const oceanUniforms = {
  uTime: { value: 0 },
  uColor: { value: new THREE.Color("#333333") },
  uHighlightColor: { value: new THREE.Color("#878787") },
  uOpacity: { value: 0.35 },
  uGridDensity: { value: 20.0 },
  uWaveAmplitude: { value: 0.12 },
  uWaveFrequency: { value: 2.0 },
  uWaveSpeed: { value: 0.3 },
};

export const oceanVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uWaveAmplitude;
  uniform float uWaveFrequency;
  uniform float uWaveSpeed;

  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Primary wave — rolling toward shore
    float wave1 = sin(pos.x * uWaveFrequency + uTime * uWaveSpeed) * uWaveAmplitude;

    // Secondary cross-wave — natural variation
    float wave2 = sin(pos.y * uWaveFrequency * 0.7 + uTime * uWaveSpeed * 0.5) * uWaveAmplitude * 0.3;

    // Tertiary ripples — fine detail
    float wave3 = sin(pos.x * uWaveFrequency * 3.0 + pos.y * 2.0 + uTime * uWaveSpeed * 1.5) * uWaveAmplitude * 0.08;

    pos.z += wave1 + wave2 + wave3;
    vElevation = pos.z;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const oceanFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uHighlightColor;
  uniform float uOpacity;
  uniform float uGridDensity;

  varying vec2 vUv;
  varying float vElevation;

  void main() {
    // Horizontal scan lines (parallel to shore)
    float lineX = smoothstep(0.02, 0.0, abs(fract(vUv.y * uGridDensity) - 0.5) - 0.48);

    // Sparse vertical grid lines
    float lineY = smoothstep(0.02, 0.0, abs(fract(vUv.x * uGridDensity * 0.25) - 0.5) - 0.48);

    float line = max(lineX, lineY * 0.3);

    // Elevation highlight — wave crests glow brighter
    float elevationFactor = smoothstep(-0.1, 0.15, vElevation);
    vec3 color = mix(uColor, uHighlightColor, elevationFactor * 0.5);

    // Edge fade — dissolve near plane boundaries
    float edgeFade = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x)
                   * smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);

    float alpha = line * uOpacity * edgeFade;
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(color, alpha);
  }
`;
