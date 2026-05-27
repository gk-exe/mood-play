import { Suspense } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { getGameById } from "@/games/registry";

export const Route = createFileRoute("/play/$gameId")({
  component: PlayRoute,
  loader: ({ params }) => {
    const game = getGameById(params.gameId);
    if (!game) throw notFound();
    return { game };
  },
});

function PlayRoute() {
  const { game } = Route.useLoaderData();
  const Game = game.Component;
  return (
    <Suspense
      fallback={
        <div className="flex h-[100dvh] w-full items-center justify-center bg-app">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-fuchsia-400" />
          </div>
        </div>
      }
    >
      <Game />
    </Suspense>
  );
}
