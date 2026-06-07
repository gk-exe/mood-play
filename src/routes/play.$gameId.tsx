import { Suspense, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getGameById } from "@/games/registry";
import { getMood } from "@/features/moods/data";
import { ComingSoon, LoadingState } from "@/components/platform";
import { recordPlay } from "@/features/player/useGameStats";

export const Route = createFileRoute("/play/$gameId")({
  component: PlayRoute,
});

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
