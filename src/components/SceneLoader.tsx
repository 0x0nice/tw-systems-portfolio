"use client";

import dynamic from "next/dynamic";
import { useSceneToggle } from "@/context/SceneToggleContext";

const PointDumeBackground = dynamic(
  () => import("@/components/PointDumeBackground"),
  { ssr: false }
);

const PhotoBackground = dynamic(
  () => import("@/components/PhotoBackground"),
  { ssr: false }
);

export default function SceneLoader() {
  const { mode } = useSceneToggle();

  if (mode === "3d") return <PointDumeBackground />;
  if (mode === "photo") return <PhotoBackground />;
  return null;
}
