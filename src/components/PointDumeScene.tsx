"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { perlin2, fbm } from "@/lib/noise";
import {
  oceanUniforms,
  oceanVertexShader,
  oceanFragmentShader,
} from "@/shaders/oceanShader";

/* ------------------------------------------------------------------ */
/*  Terrain — Wireframe landscape with Perlin-noise displacement       */
/* ------------------------------------------------------------------ */

export function Terrain() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(50, 35, 128, 96);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // Normalise to [0, 1] for spatial masks
      const nx = (x + 25) / 50; // 0 = far left, 1 = far right
      const ny = (y + 17.5) / 35; // 0 = near, 1 = far

      // --- Cliff on the left (Point Dume headland) ---
      const cliffMask = Math.max(0, 1 - nx * 2.5) * Math.max(0, ny - 0.2);
      const cliffNoise = fbm(x * 0.15, y * 0.15, 5, 2.0, 0.55);
      const cliff = cliffMask * (2.5 + cliffNoise * 2.0);

      // --- Rolling hills in the background ---
      const hillMask = Math.pow(Math.max(0, ny - 0.5) * 2, 1.5);
      const hillNoise = fbm(x * 0.08 + 7, y * 0.08 + 3, 4, 2.0, 0.5);
      const hills = hillMask * (1.2 + hillNoise * 1.5);

      // --- Beach / foreground — mostly flat with subtle undulation ---
      const beachNoise = perlin2(x * 0.1, y * 0.1) * 0.08;

      // Combine: highest wins (cliff & hills don't overlap much)
      const elevation = Math.max(cliff, hills) + beachNoise;

      pos.setZ(i, elevation);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, -8]}>
      <meshBasicMaterial
        wireframe
        color="#444444"
        transparent
        opacity={0.25}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Ocean — GLSL grid-line shader with rolling sine waves              */
/* ------------------------------------------------------------------ */

export function Ocean() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  // Clone uniforms so each instance is independent
  const uniforms = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(oceanUniforms).map(([key, val]) => [
          key,
          { value: val.value instanceof THREE.Color ? val.value.clone() : val.value },
        ])
      ),
    []
  );

  useFrame((state) => {
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0.22]} position={[-6, -2.6, -2]}>
      <planeGeometry args={[40, 28, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={oceanVertexShader}
        fragmentShader={oceanFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Sun — Minimal amber sphere with bloom pickup                       */
/* ------------------------------------------------------------------ */

export function Sun() {
  return (
    <mesh position={[-26, -2.0, -30]}>
      <sphereGeometry args={[1.8, 32, 32]} />
      <meshBasicMaterial color="#D97736" />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  CameraRig — Mouse parallax with smooth lerp                       */
/* ------------------------------------------------------------------ */

export function CameraRig() {
  const { camera } = useThree();
  const basePosition = useMemo(() => new THREE.Vector3(0, 3, 12), []);
  const target = useMemo(() => new THREE.Vector3(0, -1, -5), []);

  useFrame((state) => {
    const px = state.pointer.x; // -1 to 1
    const py = state.pointer.y; // -1 to 1

    // Target offset from mouse
    const targetX = basePosition.x + px * 1.2;
    const targetY = basePosition.y + py * 0.6;

    // Smooth follow
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (targetY - camera.position.y) * 0.02;
    camera.position.z = basePosition.z;

    camera.lookAt(target);
  });

  return null;
}
