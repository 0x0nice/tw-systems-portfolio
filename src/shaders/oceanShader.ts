/**
 * Ocean wave vertex shader — calm compound sine waves.
 * Gentle rolling motion, not jagged. Passes world-space position for specular.
 */
export const oceanWaveVertexShader = /* glsl */ `
  uniform float uTime;

  varying float vElevation;
  varying vec3 vWorldPos;

  void main() {
    vec3 pos = position;

    // Calm compound sine — gentle rolling ocean
    float wave1 = sin(pos.x * 0.2 + uTime * 0.3) * 0.5;
    float wave2 = cos(pos.y * 0.1 + uTime * 0.25) * 0.5;

    // Very subtle cross-ripple for organic feel
    float wave3 = sin(pos.x * 0.08 + pos.y * 0.06 + uTime * 0.15) * 0.2;

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

    // Technical Gray — #444444 base with slight elevation ramp
    vec3 low  = vec3(0.22);  // #383838
    vec3 mid  = vec3(0.30);  // #4D4D4D
    vec3 high = vec3(0.40);  // #666666

    vec3 baseColor = t < 0.5
      ? mix(low, mid, t / 0.5)
      : mix(mid, high, (t - 0.5) / 0.5);

    // --- Specular sun beam on water ---
    vec3 N = vec3(0.0, 1.0, 0.0);
    vec3 L = normalize(uSunPos - vWorldPos);
    vec3 V = normalize(uCameraPos - vWorldPos);
    vec3 R = reflect(-L, N);

    // Broader specular for wider beam on calm water
    float spec = pow(max(dot(R, V), 0.0), 32.0);

    // Copper/amber sun color
    vec3 sunColor = vec3(0.85, 0.47, 0.21);  // ~#D97736

    vec3 color = baseColor + sunColor * spec * uSpecularIntensity;

    float alpha = uBaseOpacity + t * 0.15 + spec * 0.4;

    gl_FragColor = vec4(color, alpha);
  }
`;
