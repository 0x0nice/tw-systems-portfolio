"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function TelemetryPlane() {
  const meshRef = useRef<THREE.Mesh>(null);

  const { positions, count } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(100, 100, 60, 60);
    const pos = geo.attributes.position;
    return { positions: pos, count: pos.count };
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const pos = meshRef.current.geometry.attributes.position;
    const t = clock.elapsedTime * 0.3;

    for (let i = 0; i < count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z =
        Math.sin(x * 0.15 + t) * 1.2 +
        Math.cos(y * 0.12 + t * 0.7) * 1.0 +
        Math.sin((x + y) * 0.08 + t * 0.5) * 0.6;
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.4, 0, 0]} position={[0, -8, -20]}>
      <planeGeometry args={[100, 100, 60, 60]} />
      <meshBasicMaterial wireframe color="#333333" />
    </mesh>
  );
}

export default function BackgroundTelemetry() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: false }}
      camera={{ position: [0, 6, 25], fov: 55, near: 0.1, far: 150 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
      }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor("#0A0A0A");
        scene.fog = new THREE.FogExp2("#0A0A0A", 0.05);
      }}
    >
      <TelemetryPlane />
    </Canvas>
  );
}
