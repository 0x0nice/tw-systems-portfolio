"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#333333] bg-[#0A0A0A]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">
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
            <span className="text-xs uppercase tracking-[0.3em] text-[#878787]">
              TW / Systems
            </span>
          )}
        </div>
        <div className="flex gap-6 text-xs uppercase tracking-widest">
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
            Operator
          </Link>
        </div>
      </div>
    </nav>
  );
}
