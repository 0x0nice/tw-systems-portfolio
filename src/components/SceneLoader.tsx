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

  // Body stays opaque #0A0A0A — backgrounds layer above it (zIndex:0)
  // and content layers above backgrounds (relative z-10 wrapper in layout)

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
