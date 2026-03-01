"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useBootAnimation } from "@/context/BootAnimationContext";
import { useSceneToggle } from "@/context/SceneToggleContext";

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { enabled, toggle } = useBootAnimation();
  const { mode, setMode } = useSceneToggle();

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
          {/* Scene toggle */}
          <button
            onClick={() => setMode(mode === "off" ? "ambient" : "off")}
            className="flex items-center gap-1.5 sm:gap-2 text-[#878787] transition-colors hover:text-[#EDEDED]"
            title={mode === "off" ? "Enable background" : "Disable background"}
          >
            <span
              className={`inline-block h-2 w-2 rounded-full transition-colors ${
                mode === "ambient" ? "bg-[#D97736]" : "bg-[#333333]"
              }`}
            />
          </button>

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
