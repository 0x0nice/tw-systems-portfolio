"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useBootAnimation } from "@/context/BootAnimationContext";
import { useSceneToggle, type SceneMode } from "@/context/SceneToggleContext";

const SCENE_OPTIONS: { value: SceneMode; label: string; dot: string }[] = [
  { value: "off", label: "OFF", dot: "bg-[#333333]" },
  { value: "3d", label: "3D", dot: "bg-[#00F5D4]" },
  { value: "photo", label: "PHOTO", dot: "bg-[#D97736]" },
];

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { enabled, toggle } = useBootAnimation();
  const { mode, setMode } = useSceneToggle();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const currentOption = SCENE_OPTIONS.find((o) => o.value === mode) ?? SCENE_OPTIONS[0];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#333333] bg-[#0A0A0A]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 md:px-12">
        <div className="flex items-center gap-4">
          {!isHome && (
            <Link
              href="/"
              className="flex items-center gap-2 text-[#878787] transition-colors hover:text-[#EDEDED]"
            >
              <ArrowLeft size={14} />
              <span className="text-xs uppercase tracking-widest">Index</span>
            </Link>
          )}
          {isHome && (
            <span className="text-xs uppercase tracking-widest sm:tracking-[0.3em] text-[#878787]">
              TW / Systems
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 sm:gap-4 md:gap-6 text-xs uppercase tracking-widest">
          {/* Scene selector dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1 sm:gap-2 text-[#878787] transition-colors hover:text-[#EDEDED]"
              title="Change background"
            >
              <span className="hidden sm:inline text-[10px] tracking-widest">
                Scene
              </span>
              <span
                className={`inline-block h-2 w-2 rounded-full transition-colors ${currentOption.dot}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 min-w-[120px] border border-[#333333] bg-[rgba(23,23,23,0.85)] backdrop-blur-md py-1">
                {SCENE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setMode(opt.value);
                      setDropdownOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-widest transition-colors ${
                      mode === opt.value
                        ? "text-[#EDEDED]"
                        : "text-[#878787] hover:text-[#EDEDED]"
                    }`}
                  >
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${opt.dot}`}
                    />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/"
            className={`transition-colors ${
              isHome ? "text-[#EDEDED]" : "text-[#878787] hover:text-[#EDEDED]"
            }`}
          >
            Index
          </Link>
          <Link
            href="/about"
            className={`transition-colors ${
              pathname === "/about"
                ? "text-[#EDEDED]"
                : "text-[#878787] hover:text-[#EDEDED]"
            }`}
          >
            <span className="sm:hidden">Builder</span>
            <span className="hidden sm:inline">The Builder</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
