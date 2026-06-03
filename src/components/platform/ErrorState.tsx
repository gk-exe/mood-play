import { Link } from "@tanstack/react-router";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

/** Shared error surface used by route + game-level error boundaries. */
export function ErrorState({
  title = "Something glitched",
  description = "We hit a snag loading this. Try again, or head back to the hub.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center bg-app px-6">
      <div className="max-w-sm text-center">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm text-white/60">{description}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {onRetry ? (
            <button
              onClick={onRetry}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 transition active:scale-95"
            >
              Try again
            </button>
          ) : null}
          <Link
            to="/"
            className="rounded-full bg-fuchsia-500 px-4 py-2 text-sm font-semibold text-black transition active:scale-95"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
