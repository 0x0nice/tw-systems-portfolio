"use client";

import dynamic from "next/dynamic";

const PointDumeBackground = dynamic(
  () => import("@/components/PointDumeBackground"),
  { ssr: false }
);

export default function SceneLoader() {
  return <PointDumeBackground />;
}
