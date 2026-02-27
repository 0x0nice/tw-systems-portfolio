import "./globals.css";
import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import { BootAnimationProvider } from "@/context/BootAnimationContext";

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
      className={`${instrumentSerif.variable} ${geistMono.variable}`}
    >
      <body className="bg-[#0A0A0A] text-[#EDEDED] font-mono antialiased">
        <BootAnimationProvider>
          <Nav />
          {children}
        </BootAnimationProvider>
      </body>
    </html>
  );
}
