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
        <div className="flex h-[100dvh] w-full items-center justify-center bg-[#faf6ee]">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-black/5">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-foreground/20" />
          </div>
        </div>
      }
    >
      <Game />
    </Suspense>
  );
}
