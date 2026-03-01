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

const BackgroundTelemetry = dynamic(
  () => import("@/components/BackgroundTelemetry"),
  { ssr: false }
);

const BackgroundDataStream = dynamic(
  () => import("@/components/BackgroundDataStream"),
  { ssr: false }
);

const BackgroundAmbientEngine = dynamic(
  () => import("@/components/BackgroundAmbientEngine"),
  { ssr: false }
);

const BackgroundCalibrationGrid = dynamic(
  () => import("@/components/BackgroundCalibrationGrid"),
  { ssr: false }
);

const BackgroundOrthogonalFlow = dynamic(
  () => import("@/components/BackgroundOrthogonalFlow"),
  { ssr: false }
);

const BackgroundSubsonicSweep = dynamic(
  () => import("@/components/BackgroundSubsonicSweep"),
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
  if (mode === "telemetry") return <BackgroundTelemetry />;
  if (mode === "datastream") return <BackgroundDataStream />;
  if (mode === "ambient") return <BackgroundAmbientEngine />;
  if (mode === "calibration") return <BackgroundCalibrationGrid />;
  if (mode === "orthogonal") return <BackgroundOrthogonalFlow />;
  if (mode === "sweep") return <BackgroundSubsonicSweep />;
  return null;
}
