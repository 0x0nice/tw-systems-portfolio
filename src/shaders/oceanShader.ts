/**
 * Ocean wave vertex shader — diagonal swell + world-space position for specular.
 * Passes vWorldPos and vElevation to the fragment shader.
 */
export const oceanWaveVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uWaveAmplitude;
  uniform float uWaveFrequency;
  uniform float uWaveSpeed;

  varying float vElevation;
  varying vec3 vWorldPos;

  void main() {
    vec3 pos = position;

    // Diagonal wave vector — rolling toward shore (+x, +y in local space)
    float diag = pos.x * 0.6 + pos.y * 0.8;

    // Primary ocean swell (long wavelength, slow)
    float wave1 = sin(diag * uWaveFrequency + uTime * uWaveSpeed) * uWaveAmplitude;

    // Cross-swell (perpendicular, shorter period)
    float cross1 = pos.x * 0.8 - pos.y * 0.6;
    float wave2 = sin(cross1 * uWaveFrequency * 1.4 - uTime * uWaveSpeed * 0.35) * uWaveAmplitude * 0.2;

    // Wind chop (high frequency, subtle)
    float wave3 = sin(diag * uWaveFrequency * 3.5 + uTime * uWaveSpeed * 2.0) * uWaveAmplitude * 0.06;

    pos.z += wave1 + wave2 + wave3;
    vElevation = pos.z;

    // World-space position for specular calculation in fragment shader
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPos.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

/**
 * Ocean fragment shader — elevation-mapped wireframe with specular sun beam.
 * The specular highlight creates a focused amber reflection along the
 * sun-to-camera vector across the water surface.
 */
export const oceanSpecularFragShader = /* glsl */ `
  uniform float uMinElev;
  uniform float uMaxElev;
  uniform float uBaseOpacity;
  uniform vec3 uSunPos;
  uniform vec3 uCameraPos;
  uniform float uSpecularIntensity;

  varying float vElevation;
  varying vec3 vWorldPos;

  void main() {
    float t = clamp(
      (vElevation - uMinElev) / (uMaxElev - uMinElev + 0.001),
      0.0, 1.0
    );

    // Technical Gray ramp — pure neutral
    vec3 low  = vec3(0.20);  // #333333
    vec3 mid  = vec3(0.35);  // #5A5A5A
    vec3 high = vec3(0.53);  // #878787

    vec3 baseColor = t < 0.5
      ? mix(low, mid, t / 0.5)
      : mix(mid, high, (t - 0.5) / 0.5);

    // --- Specular sun beam on water ---
    // Approximate the ocean normal as pointing UP (y-axis in world space)
    vec3 N = vec3(0.0, 1.0, 0.0);

    // Light direction from surface point toward the sun
    vec3 L = normalize(uSunPos - vWorldPos);

    // View direction from surface point toward the camera
    vec3 V = normalize(uCameraPos - vWorldPos);

    // Reflection of the light vector about the surface normal
    vec3 R = reflect(-L, N);

    // Specular intensity — tight falloff for focused beam
    float spec = pow(max(dot(R, V), 0.0), 64.0);

    // Copper/amber sun color for the specular highlight
    vec3 sunColor = vec3(0.85, 0.47, 0.21);  // ~#D97736

    // Blend specular into the base wireframe color
    vec3 color = baseColor + sunColor * spec * uSpecularIntensity;

    float alpha = uBaseOpacity + t * 0.18 + spec * 0.35;

    gl_FragColor = vec4(color, alpha);
  }
`;
