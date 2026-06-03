import { Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";

interface ComingSoonProps {
  title: string;
  shortDescription?: string;
  accent?: string;
}

/**
 * Reusable "Coming Soon" experience.
 *
 * Used by:
 *  - /play/:gameId when the game is registered but not yet built
 *  - /play/:gameId when the id is unknown (falls back here with a generic copy)
 */
export function ComingSoon({
  title,
  shortDescription,
  accent = "#a78bfa",
}: ComingSoonProps) {
  return (
    <AppShell>
      <div className="relative flex min-h-[100dvh] flex-col bg-app px-6 pt-6">
        <Link
          to="/"
          aria-label="Back to hub"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur transition active:scale-95"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </Link>

        <div className="relative flex flex-1 flex-col items-center justify-center text-center">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background: `radial-gradient(50% 35% at 50% 45%, ${accent}33, transparent 70%)`,
            }}
          />
          <div
            className="relative mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-white/15"
            style={{ background: `${accent}22`, boxShadow: `0 0 36px ${accent}66` }}
          >
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <p className="relative text-[10px] font-bold uppercase tracking-[0.28em] text-white/60">
            In the lab
          </p>
          <h1
            className="relative mt-2 text-4xl font-bold tracking-tight text-white"
            style={{ textShadow: `0 0 24px ${accent}88` }}
          >
            {title}
          </h1>
          {shortDescription ? (
            <p className="relative mt-2 max-w-xs text-sm text-white/65">
              {shortDescription}
            </p>
          ) : null}
          <Link
            to="/"
            className="relative mt-8 rounded-full px-5 py-2.5 text-sm font-bold text-black transition active:scale-95"
            style={{ background: accent, boxShadow: `0 0 24px ${accent}` }}
          >
            Back to hub
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
