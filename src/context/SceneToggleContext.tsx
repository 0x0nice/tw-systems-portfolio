"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface SceneToggleContextValue {
  enabled: boolean;
  toggle: () => void;
}

const SceneToggleContext = createContext<SceneToggleContextValue>({
  enabled: false,
  toggle: () => {},
});

const STORAGE_KEY = "tw-scene-3d";

export function SceneToggleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Respect reduced-motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "on") setEnabled(true);
  }, []);

  const toggle = () => {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
      return next;
    });
  };

  return (
    <SceneToggleContext.Provider value={{ enabled, toggle }}>
      {children}
    </SceneToggleContext.Provider>
  );
}

export function useSceneToggle() {
  return useContext(SceneToggleContext);
}
