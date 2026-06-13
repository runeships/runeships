import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, Noto_Sans_Runic } from "next/font/google";
import "./globals.css";
import { StickyNav } from "@/components/StickyNav";
import { Toast } from "@/components/Toast";
import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/Footer";
import { createClient } from "@/lib/supabase-server";
import { isAdminEmail } from "@/lib/admin";

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
  icons: {
    icon: "/brand/runeships-glyph.png",
    shortcut: "/brand/runeships-glyph.png",
    apple: "/brand/runeships-glyph.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Auth state once per request so StickyNav can pick the right
  // navigation variant — marketing CTA when signed out, in-app
  // (Dashboard + ProfileMenu) when signed in, regardless of which
  // page the user is on. Reading auth here makes the layout
  // dynamic, which is the right tradeoff: marketing pages still
  // render fast, and the nav stops "flashing" the wrong variant.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthed = Boolean(user);

  // Admin check — combines the env-var path with the profiles.is_admin
  // DB flag so the nav surfaces the Review queue item for either.
  let isAdmin = false;
  if (user) {
    if (isAdminEmail(user.email)) {
      isAdmin = true;
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();
      isAdmin = Boolean(profile?.is_admin);
    }
  }

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrumentSans.variable} ${notoSansRunic.variable}`}
    >
      <body className="min-h-dvh bg-cream text-ink font-body antialiased selection:bg-oxblood selection:text-cream">
        <StickyNav isAuthed={isAuthed} isAdmin={isAdmin} />
        {children}
        <Footer />
        <CookieBanner />
        <Toast />
      </body>
    </html>
  );
}
