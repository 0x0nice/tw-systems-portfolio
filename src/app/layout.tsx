import "./globals.css";
import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import { Geist_Mono } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
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
      <body className="bg-offBlack text-softWhite font-mono antialiased selection:bg-cobalt selection:text-white">
        {children}
      </body>
    </html>
  );
}
