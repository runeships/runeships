import { Reveal } from "@/components/Reveal";
import { LoginForm } from "@/components/LoginForm";

export const dynamic = "force-dynamic";

/**
 * /login server component. Reads ?next= and ?error= from the page-level
 * `searchParams` prop and hands them to the client form as props. That
 * way the page never relies on `useSearchParams()` + Suspense, which was
 * leaving some visitors stuck on the static-shell fallback during slow
 * hydration.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next ?? "/dashboard";
  const initialError = sp.error ?? null;

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-32 sm:pt-40 md:pt-48 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[480px]">
        <Reveal mode="load" delay={0.05}>
          <h1
            className="font-display font-light tracking-[-0.022em] leading-[1] text-ink"
            style={{
              fontSize: "clamp(2.4rem, 4vw + 1rem, 3.5rem)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            Sign in to RuneShips.
          </h1>
        </Reveal>

        <Reveal mode="load" delay={0.18} className="mt-6">
          <p className="text-[17px] leading-[1.55] text-muted max-w-[40ch]">
            We&rsquo;ll send a magic link to your email. No password needed.
          </p>
        </Reveal>

        <LoginForm next={next} initialError={initialError} />
      </div>
    </main>
  );
}
