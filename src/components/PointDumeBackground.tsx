"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useSceneToggle } from "@/context/SceneToggleContext";
import {
  Cliff,
  Beach,
  Ocean,
  Hills,
  Sun,
  CameraRig,
} from "@/components/PointDumeScene";

export default function PointDumeBackground() {
  const { enabled } = useSceneToggle();

  if (!enabled) return null;

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: false, alpha: false }}
      camera={{ position: [0, 0, 5], fov: 55, near: 0.1, far: 150 }}
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
        scene.fog = new THREE.FogExp2("#0A0A0A", 0.015);
      }}
    >
      <CameraRig />
      <Cliff />
      <Beach />
      <Ocean />
      <Hills />
      <Sun />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={1.8}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
