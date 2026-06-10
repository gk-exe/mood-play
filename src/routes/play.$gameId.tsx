import { Suspense, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getGameById } from "@/games/registry";
import { getMood } from "@/features/moods/data";
import { ComingSoon, LoadingState } from "@/components/platform";
import { recordPlay } from "@/features/player/useGameStats";
import {
  getTodayChallenge,
  markDailyCompleted,
  markDailyStarted,
} from "@/features/daily/challenge";

export const Route = createFileRoute("/play/$gameId")({
  component: PlayRoute,
});

/** Minimum dwell time before we trust that "the daily was attempted". */
const DAILY_COMPLETION_DWELL_MS = 30_000;

function PlayRoute() {
  const { gameId } = Route.useParams();
  const game = getGameById(gameId);

  // Record a play whenever a real, playable game mounts — powers the home
  // "Continue playing" rail without coupling to individual game internals.
  useEffect(() => {
    if (game && !game.comingSoon && game.componentLoader) {
      recordPlay(game.id);
    }
  }, [game]);

  // Daily challenge — if this game IS today's pick, mark started immediately
  // and mark completed after a short dwell. Keeps the contract simple: the
  // user showed up and played, the home card celebrates them.
  useEffect(() => {
    if (!game || game.comingSoon || !game.componentLoader) return;
    const today = getTodayChallenge();
    if (!today || today.game.id !== game.id) return;
    markDailyStarted();
    const id = window.setTimeout(() => {
      markDailyCompleted(game.id);
    }, DAILY_COMPLETION_DWELL_MS);
    return () => window.clearTimeout(id);
  }, [game]);

  if (!game) {
    return (
      <ComingSoon
        title="Unknown game"
        shortDescription="This game isn't in the lineup yet."
      />
    );
  }

  if (game.comingSoon || !game.componentLoader) {
    const mood = getMood(game.moodCategory);
    return (
      <ComingSoon
        title={game.title}
        shortDescription={game.shortDescription}
        accent={mood?.accent}
        moodId={game.moodCategory}
        gameId={game.id}
      />
    );
  }

  const Game = game.componentLoader;
  return (
    <Suspense fallback={<LoadingState />}>
      <Game />
    </Suspense>
  );
}
