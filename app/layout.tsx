import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, Noto_Sans_Runic } from "next/font/google";
import "./globals.css";
import { StickyNav } from "@/components/StickyNav";

// Editorial display serif. The opsz axis lets us scale optical sizing for
// the very large hero headline vs. smaller section titles.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
  display: "swap",
});

// Body sans. Distinctive, slightly editorial, not Inter.
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

// Elder Futhark runes — crisp rendering instead of system fallback.
const notoSansRunic = Noto_Sans_Runic({
  subsets: ["runic"],
  weight: "400",
  variable: "--font-noto-rune",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "RuneShips — Show your work. Earn your ships.",
  description:
    "RuneShips lets students complete real company tasks, get AI feedback in minutes, and build a public skill rank recruiters can trust.",
  openGraph: {
    title: "RuneShips — Show your work. Earn your ships.",
    description:
      "Real company tasks. AI feedback in minutes. A portable skill rank recruiters can trust.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrumentSans.variable} ${notoSansRunic.variable}`}
    >
      <body className="min-h-dvh bg-cream text-ink font-body antialiased selection:bg-oxblood selection:text-cream">
        <StickyNav />
        {children}
      </body>
    </html>
  );
}
