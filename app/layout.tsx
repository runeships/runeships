import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "RuneShips — Show your work. Earn your ships.",
  description:
    "RuneShips is where freshmen and sophomores prove they can do real business work — by actually doing it, for real companies. Build a reputation before anyone gives you the chance.",
  openGraph: {
    title: "RuneShips — Show your work. Earn your ships.",
    description:
      "Where freshmen and sophomores prove they can do real business work, for real companies.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrumentSans.variable}`}
    >
      <body className="min-h-dvh bg-cream text-ink font-body antialiased selection:bg-oxblood selection:text-cream">
        {children}
      </body>
    </html>
  );
}
