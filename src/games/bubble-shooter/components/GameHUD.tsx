import { RotateCcw } from "lucide-react";

interface GameHUDProps {
  score: number;
  gameOver: boolean;
  onRestart: () => void;
  onBack: () => void;
}

export function GameHUD({ score, gameOver, onRestart, onBack }: GameHUDProps) {
  return (
    <>
      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="pointer-events-auto inline-flex h-10 items-center rounded-full bg-white/70 px-4 text-sm font-medium text-foreground/70 backdrop-blur active:scale-95"
        >
          Back
        </button>
        <div className="pointer-events-auto rounded-full bg-white/70 px-4 py-2 backdrop-blur">
          <div className="text-[10px] uppercase tracking-widest text-foreground/50">Score</div>
          <div className="text-center text-base font-semibold tabular-nums text-foreground">
            {score}
          </div>
        </div>
        <button
          type="button"
          onClick={onRestart}
          aria-label="Restart"
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/70 backdrop-blur active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Game over overlay */}
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.22em] text-foreground/50">A breath</p>
          <h2 className="mt-2 text-3xl font-medium tracking-tight">Take a moment</h2>
          <p className="mt-1 text-sm text-foreground/60">Score · {score}</p>
          <button
            type="button"
            onClick={onRestart}
            className="mt-6 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background shadow-lg active:scale-95"
          >
            Play again
          </button>
        </div>
      )}
    </>
  );
}
