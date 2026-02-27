"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { perlin2, fbm } from "@/lib/noise";
import { oceanWaveVertexShader } from "@/shaders/oceanShader";

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/* ================================================================== */
/*  Shared GLSL — Elevation-mapped LiDAR wireframe                     */
/*  Technical Gray: #333 → #5A5A5A → #878787                          */
/*  Used by: Cliff, Ocean, Hills                                       */
/* ================================================================== */

const terrainVert = /* glsl */ `
  varying float vElevation;
  void main() {
    vElevation = position.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Cliff uses Y-axis as elevation (for sphere geometry) */
const cliffVert = /* glsl */ `
  varying float vElevation;
  void main() {
    vElevation = position.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const terrainFrag = /* glsl */ `
  uniform float uMinElev;
  uniform float uMaxElev;
  uniform float uBaseOpacity;
  varying float vElevation;

  void main() {
    float t = clamp(
      (vElevation - uMinElev) / (uMaxElev - uMinElev + 0.001),
      0.0, 1.0
    );

    // Technical Gray ramp — pure neutral, no color tint
    vec3 low  = vec3(0.20);  // #333333
    vec3 mid  = vec3(0.35);  // #5A5A5A
    vec3 high = vec3(0.53);  // #878787

    vec3 color = t < 0.5
      ? mix(low, mid, t / 0.5)
      : mix(mid, high, (t - 0.5) / 0.5);

    float alpha = uBaseOpacity + t * 0.18;
    gl_FragColor = vec4(color, alpha);
  }
`;

/* ================================================================== */
/*  Beach GLSL — Solid dark matte surface with subtle static grain     */
/*  NO wireframe. OPAQUE. The geometric edge of this plane IS the      */
/*  shoreline — it occludes the wireframe ocean below via depth buffer. */
/* ================================================================== */

const beachVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const beachFrag = /* glsl */ `
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec3 baseColor = vec3(0.055);  // barely above void #0A0A0A

    // Fine static sand grain
    float grain = hash(floor(vUv * 600.0)) * 0.018;

    vec3 color = baseColor + grain;

    // Tiny edge-softening at the ocean-side edge only (UV.x = 0)
    float edgeSoften = smoothstep(0.0, 0.02, vUv.x);

    gl_FragColor = vec4(color, edgeSoften);
  }
`;

/* ================================================================== */
/*  Element 5 — POINT DUME CLIFF (bottom-left frame)                   */
/*  Displaced SphereGeometry. Jagged, rocky headland peeking in from   */
/*  bottom-left corner. Only the peaks are visible in frame.           */
/* ================================================================== */

export function Cliff() {
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(8, 36, 36);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      // Normalize direction from center for radial displacement
      const len = Math.sqrt(x * x + y * y + z * z) || 1;
      const nx = x / len;
      const ny = y / len;
      const nz = z / len;

      // Heavy noise displacement — jagged rock detail
      const n1 = fbm(x * 0.2 + 3.1, z * 0.2 - 1.7, 5, 2.2, 0.55);
      const n2 = perlin2(x * 0.5, z * 0.5) * 0.4;
      const spike = perlin2(x * 1.2, y * 1.2) * 0.3;

      // Only heavily displace the upper hemisphere (peaks)
      const upperBias = smoothstep(-4, 4, y);
      const displacement = (n1 * 2.5 + n2 + spike) * upperBias;

      pos.setX(i, x + nx * displacement);
      pos.setY(i, y + ny * displacement);
      pos.setZ(i, z + nz * displacement);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uMinElev: { value: -10 },
      uMaxElev: { value: 2.0 },
      uBaseOpacity: { value: 0.14 },
    }),
    []
  );

  return (
    <mesh
      geometry={geometry}
      position={[-18, -12, -5]}
    >
      <shaderMaterial
        vertexShader={cliffVert}
        fragmentShader={terrainFrag}
        uniforms={uniforms}
        wireframe
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/* ================================================================== */
/*  Element 2 — THE BEACH (right side, SOLID — no wireframe)           */
/*  Opaque dark surface with grain. The Z-rotation creates a diagonal  */
/*  edge that reads as the Malibu shoreline against the ocean below.   */
/* ================================================================== */

export function Beach() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(30, 50, 16, 24);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // Subtle dune undulation
      const dune = perlin2(x * 0.05, y * 0.03) * 0.06;
      const ripple = perlin2(x * 0.2, y * 0.1) * 0.015;

      pos.setZ(i, dune + ripple);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0.2]}
      position={[15, -4, -30]}
    >
      <shaderMaterial
        vertexShader={beachVert}
        fragmentShader={beachFrag}
        transparent
        depthWrite
      />
    </mesh>
  );
}

/* ================================================================== */
/*  Element 3 — THE OCEAN (left side, animated wireframe)              */
/*  The ONLY animated mesh. Sits infinitesimally below the beach.      */
/*  The beach's opaque edge occludes this, creating the shoreline.     */
/* ================================================================== */

export function Ocean() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWaveAmplitude: { value: 0.08 },
      uWaveFrequency: { value: 2.2 },
      uWaveSpeed: { value: 0.2 },
      uMinElev: { value: -0.10 },
      uMaxElev: { value: 0.10 },
      uBaseOpacity: { value: 0.12 },
    }),
    []
  );

  useFrame((state) => {
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[-10, -4.2, -30]}
    >
      <planeGeometry args={[40, 40, 48, 44]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={oceanWaveVertexShader}
        fragmentShader={terrainFrag}
        uniforms={uniforms}
        wireframe
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ================================================================== */
/*  Element 4 — SANTA MONICA MOUNTAINS (far right horizon)             */
/*  Wide, rolling silhouette. Deep enough that fog fades them to a     */
/*  ghostly horizon line.                                              */
/* ================================================================== */

export function Hills() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(80, 20, 56, 18);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      const nx = (x + 40) / 80;

      // Low-frequency rolling terrain (3-octave FBM)
      const h1 = fbm(x * 0.025 + 7.0, y * 0.04 + 4.0, 3, 2.0, 0.5);
      const h2 = perlin2(x * 0.015, y * 0.018) * 0.5;

      // Mountains taller on the right side, tapering at edges
      const envelope = Math.sin(nx * Math.PI) * 0.8 + 0.2;
      const rightBias = smoothstep(0.1, 0.6, nx);

      pos.setZ(i, Math.max(0, (h1 * 2.0 + h2) * envelope * rightBias));
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uMinElev: { value: 0 },
      uMaxElev: { value: 2.5 },
      uBaseOpacity: { value: 0.10 },
    }),
    []
  );

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0.05]}
      position={[20, 0, -60]}
    >
      <shaderMaterial
        vertexShader={terrainVert}
        fragmentShader={terrainFrag}
        uniforms={uniforms}
        wireframe
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/* ================================================================== */
/*  Element 1 — THE SUN (top-left anchor)                              */
/*  Copper sphere high and to the far left. Bloom creates warm glow.   */
/* ================================================================== */

export function Sun() {
  const sunColor = useMemo(
    () => new THREE.Color("#D97736").multiplyScalar(6.0),
    []
  );

  return (
    <mesh position={[-25, 15, -40]} renderOrder={-1}>
      <sphereGeometry args={[2.0, 32, 32]} />
      <meshBasicMaterial color={sunColor} toneMapped={false} fog={false} />
    </mesh>
  );
}

/* ================================================================== */
/*  CAMERA RIG — mouse parallax with smooth lerp                       */
/*  Camera near [0, 0, 5] looking toward -z                            */
/* ================================================================== */

export function CameraRig() {
  const { camera } = useThree();
  const basePosition = useMemo(() => new THREE.Vector3(0, 0, 5), []);
  const target = useMemo(() => new THREE.Vector3(0, 0, -30), []);

  useFrame((state) => {
    const px = state.pointer.x;
    const py = state.pointer.y;

    const tx = basePosition.x + px * 1.0;
    const ty = basePosition.y + py * 0.4;

    camera.position.x += (tx - camera.position.x) * 0.02;
    camera.position.y += (ty - camera.position.y) * 0.02;
    camera.position.z = basePosition.z;

    camera.lookAt(target);
  });

  return null;
}
