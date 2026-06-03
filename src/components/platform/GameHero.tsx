import type { ReactNode } from "react";

/**
 * Themed hero strip for game / mood pages.
 * Keeps title, tagline and back affordance consistent across the platform.
 */
export function GameHero({
  title,
  tagline,
  accent,
  gradient,
  back,
  children,
}: {
  title: string;
  tagline?: string;
  accent: string;
  gradient: string;
  back?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header
      className={`relative overflow-hidden bg-gradient-to-br px-6 pb-12 pt-6 ${gradient}`}
    >
      <div
        className="pointer-events-none absolute -inset-x-20 -top-32 h-72 mood-halo"
        style={{ background: `radial-gradient(closest-side, ${accent}88, transparent 70%)` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_20%_0%,rgba(255,255,255,0.25),transparent_60%)]" />
      <div className="relative">
        {back}
        <div className="mt-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
            Entering
          </div>
          <h1
            className="mt-1 text-4xl font-bold tracking-tight text-white"
            style={{ textShadow: `0 0 30px ${accent}66` }}
          >
            {title}
          </h1>
          {tagline ? <p className="mt-2 text-sm text-white/80">{tagline}</p> : null}
          {children}
        </div>
      </div>
    </header>
  );
}
