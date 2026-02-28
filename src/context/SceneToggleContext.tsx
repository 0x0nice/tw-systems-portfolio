"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type SceneMode = "off" | "3d" | "photo";

interface SceneToggleContextValue {
  mode: SceneMode;
  setMode: (mode: SceneMode) => void;
}

const SceneToggleContext = createContext<SceneToggleContextValue>({
  mode: "off",
  setMode: () => {},
});

const STORAGE_KEY = "tw-scene-3d";

export function SceneToggleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setModeState] = useState<SceneMode>("off");

  useEffect(() => {
    // Respect reduced-motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    // Backwards-compatible: old "on" value maps to "3d"
    if (stored === "on" || stored === "3d") setModeState("3d");
    else if (stored === "photo") setModeState("photo");
  }, []);

  const setMode = (next: SceneMode) => {
    setModeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <SceneToggleContext.Provider value={{ mode, setMode }}>
      {children}
    </SceneToggleContext.Provider>
  );
}

export function useSceneToggle() {
  return useContext(SceneToggleContext);
}
