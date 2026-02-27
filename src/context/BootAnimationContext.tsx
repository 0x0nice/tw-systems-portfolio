"use client";

import { createContext, useContext, useState, useLayoutEffect } from "react";

interface BootAnimationContextValue {
  enabled: boolean;
  toggle: () => void;
}

const BootAnimationContext = createContext<BootAnimationContextValue>({
  enabled: true,
  toggle: () => {},
});

const STORAGE_KEY = "tw-boot-animation";

export function BootAnimationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [enabled, setEnabled] = useState(false);

  // Sync with localStorage before first paint to avoid flash
  useLayoutEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "on") {
      setEnabled(true);
    }
  }, []);

  const toggle = () => {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
      return next;
    });
  };

  return (
    <BootAnimationContext.Provider value={{ enabled, toggle }}>
      {children}
    </BootAnimationContext.Provider>
  );
}

export function useBootAnimation() {
  return useContext(BootAnimationContext);
}
