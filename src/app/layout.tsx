import "./globals.css";
import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import SceneLoader from "@/components/SceneLoader";
import { BootAnimationProvider } from "@/context/BootAnimationContext";
import { SceneToggleProvider } from "@/context/SceneToggleContext";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Thomas Williams | Systems Architect",
  description:
    "Architecting Decision Systems. Finance-native. AI-native. Systems-first.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${geistMono.variable} bg-[#0A0A0A]`}
    >
      <body className="bg-[#0A0A0A] text-[#EDEDED] font-mono antialiased">
        <BootAnimationProvider>
          <SceneToggleProvider>
            <SceneLoader />
            <div className="relative z-10">
              <Nav />
              {children}
            </div>
          </SceneToggleProvider>
        </BootAnimationProvider>
      </body>
    </html>
  );
}
