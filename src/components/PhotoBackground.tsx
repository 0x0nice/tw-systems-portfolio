"use client";

import Image from "next/image";

export default function PhotoBackground() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
      }}
    >
      <Image
        src="/backgrounds/malibu-sunset.png"
        alt=""
        fill
        style={{ objectFit: "cover" }}
        priority
      />
      {/* Dark gradient overlay for text legibility */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.45) 25%, rgba(10,10,10,0.2) 50%, rgba(10,10,10,0.35) 100%)",
        }}
      />
    </div>
  );
}
