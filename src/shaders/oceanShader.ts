/**
 * Ocean wave vertex shader — diagonal swell rolling toward shore.
 * Used with terrainFrag for elevation-mapped wireframe coloring.
 */
export const oceanWaveVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uWaveAmplitude;
  uniform float uWaveFrequency;
  uniform float uWaveSpeed;

  varying float vElevation;

  void main() {
    vec3 pos = position;

    // Diagonal wave vector — rolling toward shore (+x, +y in local space)
    float diag = pos.x * 0.6 + pos.y * 0.8;

    // Primary ocean swell (long wavelength, slow)
    float wave1 = sin(diag * uWaveFrequency + uTime * uWaveSpeed) * uWaveAmplitude;

    // Cross-swell (perpendicular, shorter period)
    float cross = pos.x * 0.8 - pos.y * 0.6;
    float wave2 = sin(cross * uWaveFrequency * 1.4 - uTime * uWaveSpeed * 0.35) * uWaveAmplitude * 0.2;

    // Wind chop (high frequency, subtle)
    float wave3 = sin(diag * uWaveFrequency * 3.5 + uTime * uWaveSpeed * 2.0) * uWaveAmplitude * 0.06;

    pos.z += wave1 + wave2 + wave3;
    vElevation = pos.z;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;
