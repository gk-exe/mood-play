import { Link } from "@tanstack/react-router";
import { Calendar, Check, Flame, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { getMood } from "@/features/moods/data";
import {
  formatCountdown,
  getTodayChallenge,
  markDailyStarted,
  msUntilTomorrow,
  useDailyStatus,
} from "@/features/daily/challenge";

/**
 * Daily Challenge — the hero "reason to return".
 * Deterministic per local day; tracks started/completed in localStorage only.
 */
export function DailyChallengeCard() {
  const challenge = getTodayChallenge();
  const status = useDailyStatus();
  const [countdown, setCountdown] = useState(() => formatCountdown(msUntilTomorrow()));

  useEffect(() => {
    const id = window.setInterval(() => {
      setCountdown(formatCountdown(msUntilTomorrow()));
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (!challenge) return null;

  const { game, goal, tag } = challenge;
  const mood = getMood(game.moodCategory);
  const accent = mood?.accent ?? "#e879f9";

  const state: "fresh" | "started" | "completed" = status.completed
    ? "completed"
    : status.started
      ? "started"
      : "fresh";

  const cta =
    state === "completed" ? "Replay" : state === "started" ? "Continue" : "Accept";

  return (
    <section aria-label="Today's daily challenge" className="relative">
      <Link
        to="/play/$gameId"
        params={{ gameId: game.id }}
        onClick={() => markDailyStarted()}
        className="group relative block overflow-hidden rounded-[28px] p-[1.5px] transition active:scale-[0.985]"
        style={{
          background: `conic-gradient(from 140deg at 50% 50%, ${accent}, #ffffff22 30%, ${accent} 60%, #ffffff10 85%, ${accent})`,
          boxShadow: `0 24px 60px -28px ${accent}`,
        }}
      >
        {/* Slow rotating sheen */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[28px] opacity-70"
          style={{
            background: `conic-gradient(from 0deg, transparent, ${accent}55, transparent 40%)`,
            animation: "vg-daily-spin 8s linear infinite",
          }}
        />

        <div
          className="relative rounded-[26px] p-5"
          style={{
            background:
              "linear-gradient(160deg, rgba(15,15,25,0.94), rgba(20,12,30,0.96))",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 ring-1 ring-white/15 backdrop-blur">
              <Calendar className="h-3 w-3" style={{ color: accent }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/85">
                Daily challenge
              </span>
            </div>

            {state === "completed" ? (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ background: `${accent}22`, color: accent }}
              >
                <Check className="h-3 w-3" /> Done
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55 ring-1 ring-white/10">
                <Flame className="h-3 w-3" style={{ color: accent }} />
                Resets {countdown}
              </span>
            )}
          </div>

          <p
            className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em]"
            style={{ color: accent }}
          >
            {tag}
          </p>
          <h2 className="mt-1 text-[1.7rem] font-bold leading-[1.05] tracking-tight text-white">
            {goal}
          </h2>
          <p className="mt-1 text-sm text-white/65">
            in <span className="font-semibold text-white/90">{game.title}</span>
            {state === "started" && !status.completed
              ? " · you're on it"
              : state === "completed"
                ? " · come back tomorrow for something new"
                : ""}
          </p>

          <div className="mt-5 flex items-center justify-between gap-3">
            <span
              className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold text-black transition group-hover:scale-[1.03]"
              style={{ background: accent, boxShadow: `0 0 28px ${accent}` }}
            >
              <Play className="h-4 w-4 fill-current" /> {cta}
            </span>
            <span className="text-right text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
              new pick every<br />midnight
            </span>
          </div>
        </div>
      </Link>

      <style>{`
        @keyframes vg-daily-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
