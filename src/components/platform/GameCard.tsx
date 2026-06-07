import { Link } from "@tanstack/react-router";
import { Clock, Lock, Play, Trophy } from "lucide-react";
import type { GameMeta } from "@/games/registry";
import { getMood } from "@/features/moods/data";
import { readBest } from "@/features/player/useGameStats";

interface GameCardProps {
  game: GameMeta;
  index?: number;
}

/**
 * Platform-standard game card.
 *
 * Mood-themed accent, status-aware CTA, single layout for every game.
 * Future games render through this — do not fork per game.
 */
export function GameCard({ game, index = 0 }: GameCardProps) {
  const mood = getMood(game.moodCategory);
  const accent = mood?.accent ?? "#a78bfa";
  const locked = game.comingSoon;
  const best = locked ? null : readBest(game.id);

  return (
    <Link
      to="/play/$gameId"
      params={{ gameId: game.id }}
      aria-label={`${game.title} — ${game.shortDescription}`}
      className="group relative block overflow-hidden rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10 backdrop-blur transition active:scale-[0.98] mood-enter"
      style={{
        animationDelay: `${index * 70}ms`,
        boxShadow: `0 10px 30px -18px ${accent}aa`,
      }}
    >
      <div
        className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full opacity-40 blur-2xl"
        style={{ background: accent }}
      />
      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight text-white">
              {game.title}
            </h3>
            {locked ? (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">
                Soon
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-xs text-white/60">
            {game.shortDescription}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.18em] text-white/40">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {game.estimatedPlayTime}m
            </span>
            <span>{game.difficulty}</span>
            {best != null ? (
              <span
                className="inline-flex items-center gap-1 font-bold"
                style={{ color: accent }}
              >
                <Trophy className="h-3 w-3" /> {best.toLocaleString()}
              </span>
            ) : null}
          </div>
        </div>
        <span
          className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-black transition group-hover:scale-105"
          style={{
            background: locked ? "rgba(255,255,255,0.08)" : accent,
            color: locked ? "rgba(255,255,255,0.65)" : "#000",
            boxShadow: locked ? "none" : `0 0 24px ${accent}`,
          }}
        >
          {locked ? <Lock className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
        </span>
      </div>
    </Link>
  );
}
