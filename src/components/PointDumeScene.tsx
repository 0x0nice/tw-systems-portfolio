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
/*  #333 (troughs) → #878 (mid) → bright peaks (bloom pickup)         */
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

    // Elevation color ramp: dark base → mid gray → bright peaks
    vec3 low  = vec3(0.12, 0.14, 0.12);  // dark green-gray
    vec3 mid  = vec3(0.22, 0.26, 0.22);  // muted sage
    vec3 high = vec3(0.38, 0.44, 0.38);  // bright peaks

    vec3 color = t < 0.5
      ? mix(low, mid, t / 0.5)
      : mix(mid, high, (t - 0.5) / 0.5);

    float alpha = uBaseOpacity + t * 0.25;
    gl_FragColor = vec4(color, alpha);
  }
`;

/* ================================================================== */
/*  Zone 1 — THE CLIFF (Point Dume headland, left foreground)          */
/*  Steep, jagged, elevated. The defining geographic feature.          */
/* ================================================================== */

export function Cliff() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(16, 18, 48, 48);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      const nx = (x + 8) / 16;
      const ny = (y + 9) / 18;

      // Primary ridge running diagonally (NW → SE)
      const ridge = Math.max(0, 1 - Math.abs(nx - 0.45 + ny * 0.15) * 2.5);

      // High-frequency jagged rock noise
      const n1 = fbm(x * 0.22 + 1.7, y * 0.22 - 0.3, 5, 2.2, 0.58);
      const n2 = perlin2(x * 0.5, y * 0.4) * 0.35;

      // Steep cliff face profile
      const profile = Math.pow(ridge, 0.55) * 4.2;
      const detail = (n1 * 1.6 + n2) * ridge;

      // Taper edges to zero for clean boundary
      const fade = Math.min(
        smoothstep(0, 0.18, nx),
        smoothstep(0, 0.18, 1 - nx),
        smoothstep(0, 0.22, ny),
        smoothstep(0, 0.22, 1 - ny)
      );

      pos.setZ(i, (profile + detail) * fade);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uMinElev: { value: 0 },
      uMaxElev: { value: 5.5 },
      uBaseOpacity: { value: 0.12 },
    }),
    []
  );

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0.1]}
      position={[-10, -2.8, -2]}
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
/*  Zone 2 — ZUMA BEACH (right side, mostly flat)                      */
/*  Subtle sand-dune undulation extending into the distance.           */
/* ================================================================== */

export function Beach() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(24, 30, 32, 40);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // Subtle dune undulation
      const dune = perlin2(x * 0.07, y * 0.05) * 0.12;
      const ripple = perlin2(x * 0.3, y * 0.15) * 0.03;

      // Gentle slope toward ocean on left edge
      const nx = (x + 12) / 24;
      const slope = Math.max(0, (1 - nx) * 0.06);

      pos.setZ(i, dune + ripple - slope);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uMinElev: { value: -0.15 },
      uMaxElev: { value: 0.18 },
      uBaseOpacity: { value: 0.06 },
    }),
    []
  );

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[9, -3.1, -8]}
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
/*  Zone 3 — THE OCEAN (center-left, below terrain)                    */
/*  Wireframe grid with diagonal wave displacement via useFrame.       */
/* ================================================================== */

export function Ocean() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWaveAmplitude: { value: 0.1 },
      uWaveFrequency: { value: 2.0 },
      uWaveSpeed: { value: 0.25 },
      uMinElev: { value: -0.12 },
      uMaxElev: { value: 0.12 },
      uBaseOpacity: { value: 0.10 },
    }),
    []
  );

  useFrame((state) => {
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0.18]}
      position={[-5, -3.2, -5]}
    >
      <planeGeometry args={[38, 32, 50, 50]} />
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
/*  Zone 4 — HORIZON HILLS (Santa Monica Mountains, far background)    */
/*  Smooth low-frequency rolling terrain fading into the void.         */
/* ================================================================== */

export function Hills() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(55, 18, 56, 24);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // Smooth low-frequency rolling hills
      const h1 = fbm(x * 0.035 + 5, y * 0.05 + 3, 3, 2.0, 0.5);
      const h2 = perlin2(x * 0.02, y * 0.025) * 0.6;

      // Envelope — taller in center, fading at edges
      const nx = (x + 27.5) / 55;
      const envelope = Math.sin(nx * Math.PI) * 0.85 + 0.15;

      pos.setZ(i, Math.max(0, (h1 * 1.4 + h2) * envelope));
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uMinElev: { value: 0 },
      uMaxElev: { value: 2.2 },
      uBaseOpacity: { value: 0.08 },
    }),
    []
  );

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -2.8, -25]}
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
/*  THE SUN — brilliant copper sphere on the left horizon              */
/*  toneMapped={false} + color multiplier ensures bloom pickup.        */
/* ================================================================== */

export function Sun() {
  // Multiply base copper color for luminance that exceeds bloom threshold
  const sunColor = useMemo(
    () => new THREE.Color("#D97736").multiplyScalar(5.0),
    []
  );

  return (
    <mesh position={[-24, -2.0, -18]} renderOrder={-1}>
      <sphereGeometry args={[1.1, 32, 32]} />
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
  const target = useMemo(() => new THREE.Vector3(0, 0, -8), []);

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
