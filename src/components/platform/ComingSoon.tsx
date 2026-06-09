import { Link } from "@tanstack/react-router";
import { ArrowLeft, Bell, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GAMES } from "@/games/registry";
import { getMood } from "@/features/moods/data";
import { FeedbackBar } from "@/components/platform/FeedbackBar";

interface ComingSoonProps {
  title: string;
  shortDescription?: string;
  accent?: string;
  /** Optional mood context to suggest related live games. */
  moodId?: string;
  /** Game id of the coming-soon entry (omit for unknown ids). */
  gameId?: string;
}

/**
 * Reusable "Coming Soon" experience.
 *
 * Renders a confident teaser — not an apology. Surfaces 1–2 live games in
 * the same mood so the user always has a "play something now" path.
 */
export function ComingSoon({
  title,
  shortDescription,
  accent = "#a78bfa",
  moodId,
  gameId,
}: ComingSoonProps) {
  const suggestions = (
    moodId
      ? GAMES.filter(
          (g) => g.moodCategory === moodId && g.status === "live" && g.id !== gameId,
        )
      : GAMES.filter((g) => g.status === "live").slice(0, 2)
  ).slice(0, 2);

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

        <div className="relative flex flex-1 flex-col items-center justify-center pb-10 text-center">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background: `radial-gradient(50% 35% at 50% 35%, ${accent}33, transparent 70%)`,
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
          <div
            className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10 backdrop-blur"
          >
            <Bell className="h-3 w-3" style={{ color: accent }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
              Cooking now · drops soon
            </span>
          </div>

          {suggestions.length > 0 ? (
            <div className="relative mt-10 w-full max-w-xs">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                Play right now
              </div>
              <div className="space-y-2">
                {suggestions.map((g) => {
                  const m = getMood(g.moodCategory);
                  const a = m?.accent ?? "#a78bfa";
                  return (
                    <Link
                      key={g.id}
                      to="/play/$gameId"
                      params={{ gameId: g.id }}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10 backdrop-blur transition active:scale-[0.98]"
                    >
                      <div className="min-w-0 text-left">
                        <div className="truncate text-sm font-semibold text-white">
                          {g.title}
                        </div>
                        <div className="truncate text-[11px] text-white/55">
                          {g.shortDescription}
                        </div>
                      </div>
                      <span
                        className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black"
                        style={{ background: a }}
                      >
                        Play
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}

          {gameId ? (
            <div className="relative mt-8 w-full max-w-xs">
              <div className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                Excited for this one?
              </div>
              <FeedbackBar gameId={gameId} accent={accent} />
            </div>
          ) : null}

          <Link
            to="/suggest"
            className="relative mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/75 ring-1 ring-white/10 transition active:scale-95"
          >
            <Sparkles className="h-3 w-3" style={{ color: accent }} />
            Suggest what we build next
          </Link>

          <Link
            to="/"
            className="relative mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55 underline-offset-4 hover:underline"
          >
            Back to hub
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
