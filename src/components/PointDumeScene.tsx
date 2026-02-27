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
/* ================================================================== */

const terrainVert = /* glsl */ `
  varying float vElevation;
  void main() {
    vElevation = position.z;
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
/*  Zone 1 — POINT DUME CLIFF (bottom-left foreground)                 */
/*  Steep, rugged headland. Partially off-screen for dramatic framing. */
/* ================================================================== */

export function Cliff() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(20, 22, 48, 48);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      const nx = (x + 10) / 20;
      const ny = (y + 11) / 22;

      // Diagonal ridge spine running NW → SE through the headland
      const ridge = Math.max(0, 1 - Math.abs(nx - 0.55 + ny * 0.2) * 3.0);

      // Aggressive rocky detail — 5-octave FBM + high-freq Perlin
      const n1 = fbm(x * 0.25 + 2.3, y * 0.25 - 1.1, 5, 2.2, 0.55);
      const n2 = perlin2(x * 0.6, y * 0.5) * 0.3;

      // Steep cliff profile with power curve
      const profile = Math.pow(ridge, 0.5) * 5.0;
      const detail = (n1 * 2.0 + n2) * ridge;

      // Hard edge fade — taper to zero at mesh boundaries
      const fade = Math.min(
        smoothstep(0, 0.12, nx),
        smoothstep(0, 0.12, 1 - nx),
        smoothstep(0, 0.15, ny),
        smoothstep(0, 0.15, 1 - ny)
      );

      pos.setZ(i, (profile + detail) * fade);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uMinElev: { value: 0 },
      uMaxElev: { value: 6.0 },
      uBaseOpacity: { value: 0.15 },
    }),
    []
  );

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0.15]}
      position={[-14, -5, 2]}
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
/*  Zone 2 — ZUMA BEACH (right side, static flat sand)                 */
/*  Z-rotation angles left edge to form shoreline with ocean below.    */
/* ================================================================== */

export function Beach() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(28, 40, 20, 28);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // Subtle dune undulation only
      const dune = perlin2(x * 0.06, y * 0.04) * 0.08;
      const ripple = perlin2(x * 0.25, y * 0.12) * 0.02;

      // Beach slopes down toward ocean on left edge (-x side)
      const nx = (x + 14) / 28;
      const slope = Math.max(0, (1 - nx) * 0.08);

      pos.setZ(i, dune + ripple - slope);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uMinElev: { value: -0.10 },
      uMaxElev: { value: 0.12 },
      uBaseOpacity: { value: 0.015 },
    }),
    []
  );

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, -0.12]}
      position={[10, -4.4, -12]}
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
/*  Zone 3 — THE OCEAN (center-left, 0.2u below beach)                */
/*  Only animated mesh. Opposing Z-rotation creates diagonal shoreline */
/*  where ocean and beach planes intersect.                            */
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
      uBaseOpacity: { value: 0.06 },
    }),
    []
  );

  useFrame((state) => {
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0.12]}
      position={[-4, -4.6, -8]}
    >
      <planeGeometry args={[42, 36, 44, 40]} />
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
/*  Zone 4 — SANTA MONICA MOUNTAINS (far right horizon)                */
/*  Rolling silhouette, right-biased. Fog-attenuated at z=-35.         */
/* ================================================================== */

export function Hills() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(60, 16, 44, 14);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      const nx = (x + 30) / 60;

      // Low-frequency rolling terrain (3-octave FBM)
      const h1 = fbm(x * 0.03 + 7.0, y * 0.045 + 4.0, 3, 2.0, 0.5);
      const h2 = perlin2(x * 0.018, y * 0.02) * 0.5;

      // Mountains taller on the right side (+x), tapering at edges
      const envelope = Math.sin(nx * Math.PI) * 0.8 + 0.2;
      const rightBias = smoothstep(0.1, 0.6, nx);

      pos.setZ(i, Math.max(0, (h1 * 1.8 + h2) * envelope * rightBias));
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uMinElev: { value: 0 },
      uMaxElev: { value: 2.0 },
      uBaseOpacity: { value: 0.04 },
    }),
    []
  );

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0.05]}
      position={[8, -3.5, -35]}
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
/*  THE SUN — copper sphere on the left horizon                        */
/*  Half-submerged on ocean plane. Bloom creates ambient warm glow.     */
/* ================================================================== */

export function Sun() {
  const sunColor = useMemo(
    () => new THREE.Color("#D97736").multiplyScalar(5.0),
    []
  );

  return (
    <mesh position={[-22, -4.0, -22]} renderOrder={-1}>
      <sphereGeometry args={[1.2, 32, 32]} />
      <meshBasicMaterial color={sunColor} toneMapped={false} />
    </mesh>
  );
}

/* ================================================================== */
/*  CAMERA RIG — mouse parallax with smooth lerp                       */
/* ================================================================== */

export function CameraRig() {
  const { camera } = useThree();
  const basePosition = useMemo(() => new THREE.Vector3(0, 3.5, 14), []);
  const target = useMemo(() => new THREE.Vector3(0, 2.5, -8), []);

  useFrame((state) => {
    const px = state.pointer.x;
    const py = state.pointer.y;

    const tx = basePosition.x + px * 1.2;
    const ty = basePosition.y + py * 0.6;

    camera.position.x += (tx - camera.position.x) * 0.02;
    camera.position.y += (ty - camera.position.y) * 0.02;
    camera.position.z = basePosition.z;

    camera.lookAt(target);
  });

  return null;
}
