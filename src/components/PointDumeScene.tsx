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
const SUN_POS: [number, number, number] = [-35, 20, -60];

/* ================================================================== */
/*  Shared GLSL — Elevation-mapped LiDAR wireframe                     */
/*  Technical Gray for mountains                                       */
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

    // Technical Gray ramp
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
/*  NO wireframe. The S-curve edge of this plane IS the shoreline.     */
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

    // Soft fade at the left edge (ocean side, UV.x = 0)
    float edgeSoften = smoothstep(0.0, 0.02, vUv.x);

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

      const len = Math.sqrt(x * x + y * y + z * z) || 1;
      const nx = x / len;
      const ny = y / len;
      const nz = z / len;

      // Heavy noise displacement — jagged rock detail
      const n1 = fbm(x * 0.18 + 3.1, z * 0.18 - 1.7, 5, 2.2, 0.55);
      const n2 = perlin2(x * 0.45, z * 0.45) * 0.5;
      const spike = perlin2(x * 1.0, y * 1.0) * 0.35;

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
      uBaseOpacity: { value: 0.14 },
    }),
    []
  );

  return (
    <mesh geometry={geometry} position={[-22, -12, 6]}>
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
/*  Element 2 — S-CURVE BEACH (right 1/3, SOLID — no wireframe)       */
/*  The left edge is vertex-displaced with a sine-based S-curve so     */
/*  the shoreline sweeps organically instead of being a straight line. */
/* ================================================================== */

export function Beach() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(100, 100, 50, 50);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      const y = pos.getY(i);

      // S-CURVE: Displace X based on Y (depth) to create the sweeping cove
      // Primary S-curve
      x += Math.sin(y * 0.05) * 15;
      // Secondary organic wobble
      x += Math.sin(y * 0.12) * 4;
      // Subtle micro-variation
      x += perlin2(x * 0.02, y * 0.02) * 2;

      // Very subtle dune undulation on Z
      const dune = perlin2(x * 0.03, y * 0.02) * 0.04;

      pos.setX(i, x);
      pos.setZ(i, dune);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[25, -5, -40]}
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
/*  Element 3 — THE OCEAN (left 2/3, animated wireframe + specular)    */
/*  Calm compound sine waves. Sits slightly below the beach.           */
/*  The beach's opaque S-curve edge occludes this = the shoreline.     */
/* ================================================================== */

export function Ocean() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const { camera } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMinElev: { value: -1.2 },
      uMaxElev: { value: 1.2 },
      uBaseOpacity: { value: 0.13 },
      uSunPos: { value: new THREE.Vector3(...SUN_POS) },
      uCameraPos: { value: new THREE.Vector3(0, 0, 5) },
      uSpecularIntensity: { value: 2.5 },
    }),
    []
  );

  useFrame((state) => {
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uCameraPos.value.copy(camera.position);
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, -5.2, -40]}>
      <planeGeometry args={[120, 100, 60, 55]} />
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
/*  Element 4 — SANTA MONICA MOUNTAINS (far right horizon)             */
/*  Vertex-displaced peaks using compound sine for rolling hills.      */
/*  Slopes down toward center-left to meet the water line.             */
/* ================================================================== */

export function Hills() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(100, 30, 70, 24);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // Normalized X position [0..1] across the plane
      const nx = (x + 50) / 100;

      // Compound sine peaks — rolling mountain silhouette
      const peak1 = Math.abs(Math.sin(x * 0.05)) * 15;
      const peak2 = Math.cos(x * 0.1) * 5;
      const peak3 = Math.sin(x * 0.03 + 1.5) * 3;

      // Combine peaks
      let z = peak1 + peak2 + peak3;

      // Slope down toward left (center of screen → water)
      const leftFade = smoothstep(0.0, 0.45, nx);
      z *= leftFade;

      // Taper at far edges
      const edgeFade = Math.sin(nx * Math.PI);
      z *= edgeFade * 0.8 + 0.2;

      // Subtle noise for organic detail
      z += perlin2(x * 0.04, y * 0.06) * 1.5;

      pos.setZ(i, Math.max(0, z));
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uMinElev: { value: 0 },
      uMaxElev: { value: 18 },
      uBaseOpacity: { value: 0.10 },
    }),
    []
  );

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[20, -5, -80]}
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
      position={[10, -2, -70]}
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
