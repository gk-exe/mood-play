import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getGameById, getMood } from "@/games/registry";
import { ComingSoon, LoadingState } from "@/components/platform";
import { getMood as getMoodById } from "@/features/moods/data";

export const Route = createFileRoute("/play/$gameId")({
  component: PlayRoute,
});

function PlayRoute() {
  const { gameId } = Route.useParams();
  const game = getGameById(gameId);

  // Unknown id → generic coming-soon fallback. Never throws notFound here so
  // shared links never dead-end.
  if (!game) {
    return <ComingSoon title="Unknown game" shortDescription="This game isn't in the lineup yet." />;
  }

  if (game.comingSoon || !game.componentLoader) {
    const mood = getMoodById(game.moodCategory);
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

// Re-export to keep registry helpers reachable from a single import path.
export { getMood };
