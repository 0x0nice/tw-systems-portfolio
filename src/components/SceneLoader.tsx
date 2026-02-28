"use client";

import { useEffect } from "react";
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

  // Make body transparent so zIndex:-1 backgrounds show through
  useEffect(() => {
    document.body.style.backgroundColor =
      mode === "off" ? "#0A0A0A" : "transparent";
  }, [mode]);

  if (mode === "3d") return <PointDumeBackground />;
  if (mode === "photo") return <PhotoBackground />;
  return null;
}
