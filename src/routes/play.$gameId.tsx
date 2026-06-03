import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getGameById } from "@/games/registry";
import { getMood } from "@/features/moods/data";
import { ComingSoon, LoadingState } from "@/components/platform";

export const Route = createFileRoute("/play/$gameId")({
  component: PlayRoute,
});

function PlayRoute() {
  const { gameId } = Route.useParams();
  const game = getGameById(gameId);

  // Unknown id → generic coming-soon fallback. Never throws notFound so
  // shared/external links never dead-end.
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
