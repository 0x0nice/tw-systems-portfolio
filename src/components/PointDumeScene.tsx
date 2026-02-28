"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { perlin2, fbm } from "@/lib/noise";
import {
  oceanWaveVertexShader,
  oceanSpecularFragShader,
} from "@/shaders/oceanShader";

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/* ================================================================== */
/*  Shared constants                                                   */
/* ================================================================== */

/** Sun world-space position — shared between Sun mesh and Ocean specular */
const SUN_POS: [number, number, number] = [-35, 25, -50];

/* ================================================================== */
/*  Shared GLSL — Elevation-mapped LiDAR wireframe                     */
/*  Technical Gray: #333 → #5A5A5A → #878787                          */
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
/*  NO wireframe. The geometric edge of this plane IS the shoreline.   */
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
    vec3 baseColor = vec3(0.04);  // barely above void #0A0A0A

    // Fine static sand grain
    float grain = hash(floor(vUv * 800.0)) * 0.014;

    vec3 color = baseColor + grain;

    // Soft fade at the ocean-side edge (UV.x = 0 side)
    float edgeSoften = smoothstep(0.0, 0.015, vUv.x);

    gl_FragColor = vec4(color, edgeSoften);
  }
`;

/* ================================================================== */
/*  Element 1 — POINT DUME CLIFF (bottom-left foreground)              */
/*  Displaced SphereGeometry. Jagged, rocky headland partially         */
/*  off-screen in the bottom-left corner.                              */
/* ================================================================== */

export function Cliff() {
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(10, 40, 40);
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
      const n1 = fbm(x * 0.18 + 3.1, z * 0.18 - 1.7, 5, 2.2, 0.55);
      const n2 = perlin2(x * 0.45, z * 0.45) * 0.5;
      const spike = perlin2(x * 1.0, y * 1.0) * 0.35;

      // Only heavily displace the upper hemisphere (peaks)
      const upperBias = smoothstep(-5, 5, y);
      const displacement = (n1 * 3.0 + n2 + spike) * upperBias;

      pos.setX(i, x + nx * displacement);
      pos.setY(i, y + ny * displacement);
      pos.setZ(i, z + nz * displacement);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uMinElev: { value: -12 },
      uMaxElev: { value: 4.0 },
      uBaseOpacity: { value: 0.16 },
    }),
    []
  );

  return (
    <mesh geometry={geometry} position={[-20, -10, 8]}>
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
/*  Element 2 — ZUMA BEACH (right side, SOLID — no wireframe)          */
/*  Opaque dark matte surface with grain. Sweeps diagonally from       */
/*  the right toward center-left. Its edge over the ocean IS the       */
/*  shoreline.                                                         */
/* ================================================================== */

export function Beach() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(35, 55, 18, 28);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // Subtle dune undulation
      const dune = perlin2(x * 0.04, y * 0.025) * 0.05;
      const ripple = perlin2(x * 0.18, y * 0.08) * 0.012;

      pos.setZ(i, dune + ripple);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0.25]}
      position={[10, -4, -30]}
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
/*  Element 3 — THE OCEAN (left side, animated wireframe + specular)   */
/*  Sits slightly below the beach. The beach's opaque edge occludes    */
/*  this, creating the shoreline. Specular beam from the sun.          */
/* ================================================================== */

export function Ocean() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const { camera } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWaveAmplitude: { value: 0.08 },
      uWaveFrequency: { value: 2.2 },
      uWaveSpeed: { value: 0.2 },
      uMinElev: { value: -0.10 },
      uMaxElev: { value: 0.10 },
      uBaseOpacity: { value: 0.12 },
      uSunPos: { value: new THREE.Vector3(...SUN_POS) },
      uCameraPos: { value: new THREE.Vector3(0, 0, 5) },
      uSpecularIntensity: { value: 2.0 },
    }),
    []
  );

  useFrame((state) => {
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    // Update camera position each frame for accurate specular
    materialRef.current.uniforms.uCameraPos.value.copy(camera.position);
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-10, -4.2, -30]}>
      <planeGeometry args={[45, 45, 52, 48]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={oceanWaveVertexShader}
        fragmentShader={oceanSpecularFragShader}
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
/*  Element 4 — SANTA MONICA MOUNTAINS (far background horizon)        */
/*  Wide rolling silhouette deep in -z. Fog fades them to ghostly      */
/*  horizon line on the right side.                                    */
/* ================================================================== */

export function Hills() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(90, 22, 64, 20);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      const nx = (x + 45) / 90;

      // Low-frequency rolling terrain (3-octave FBM)
      const h1 = fbm(x * 0.022 + 7.0, y * 0.035 + 4.0, 3, 2.0, 0.5);
      const h2 = perlin2(x * 0.012, y * 0.015) * 0.6;

      // Mountains taller on the right side, tapering at edges
      const envelope = Math.sin(nx * Math.PI) * 0.8 + 0.2;
      const rightBias = smoothstep(0.1, 0.55, nx);

      pos.setZ(i, Math.max(0, (h1 * 2.5 + h2) * envelope * rightBias));
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uMinElev: { value: 0 },
      uMaxElev: { value: 3.0 },
      uBaseOpacity: { value: 0.08 },
    }),
    []
  );

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0.04]}
      position={[15, 3, -70]}
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
/*  Element 5 — THE SUN (top-left, elevated, extreme bloom)            */
/*  Copper sphere high and to the far left. Bloom creates warm glow.   */
/* ================================================================== */

export function Sun() {
  const sunColor = useMemo(
    () => new THREE.Color("#D97736").multiplyScalar(7.0),
    []
  );

  return (
    <mesh position={SUN_POS} renderOrder={-1}>
      <sphereGeometry args={[2.5, 32, 32]} />
      <meshBasicMaterial color={sunColor} toneMapped={false} fog={false} />
    </mesh>
  );
}

/* ================================================================== */
/*  HORIZON GLOW — Amber PointLight behind mountains                   */
/*  Simulates the warm under-lighting of a sunset against terrain.     */
/* ================================================================== */

export function HorizonGlow() {
  return (
    <pointLight
      position={[10, -2, -65]}
      color="#D97736"
      intensity={8}
      distance={80}
      decay={2}
    />
  );
}

/* ================================================================== */
/*  CAMERA RIG — mouse parallax with smooth lerp                       */
/*  Camera at [0, 0, 5] looking toward -z                              */
/* ================================================================== */

export function CameraRig() {
  const { camera } = useThree();
  const basePosition = useMemo(() => new THREE.Vector3(0, 0, 5), []);
  const target = useMemo(() => new THREE.Vector3(0, 0, -30), []);

  useFrame((state) => {
    const px = state.pointer.x;
    const py = state.pointer.y;

    const tx = basePosition.x + px * 1.2;
    const ty = basePosition.y + py * 0.5;

    camera.position.x += (tx - camera.position.x) * 0.02;
    camera.position.y += (ty - camera.position.y) * 0.02;
    camera.position.z = basePosition.z;

    camera.lookAt(target);
  });

  return null;
}
