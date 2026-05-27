import { RotateCcw } from "lucide-react";
import { MODES } from "../constants";
import type { GameMode } from "../types";

interface GameHUDProps {
  mode: GameMode;
  score: number;
  level: number;
  best: number;
  gameOver: boolean;
  onRestart: () => void;
  onBack: () => void;
}

export function GameHUD({ mode, score, level, best, gameOver, onRestart, onBack }: GameHUDProps) {
  return (
    <>
      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between px-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="pointer-events-auto inline-flex h-10 items-center rounded-full bg-white/70 px-4 text-sm font-medium text-foreground/70 backdrop-blur active:scale-95"
        >
          ←
        </button>
        <div className="pointer-events-auto rounded-2xl bg-white/75 px-4 py-2 text-center backdrop-blur">
          <div className="text-[10px] uppercase tracking-widest text-foreground/45">
            {MODES[mode].label} · L{level}
          </div>
          <div className="text-lg font-semibold tabular-nums text-foreground leading-tight">
            {score}
          </div>
          <div className="text-[10px] tabular-nums text-foreground/40">best {best}</div>
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
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/65 backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.22em] text-foreground/50">A breath</p>
          <h2 className="mt-2 text-3xl font-medium tracking-tight">Take a moment</h2>
          <p className="mt-2 text-sm text-foreground/60">
            Score · <span className="tabular-nums">{score}</span>
          </p>
          {score >= best && score > 0 && (
            <p className="mt-1 text-xs uppercase tracking-widest text-foreground/45">
              New best
            </p>
          )}
          <p className="mt-1 text-xs text-foreground/45">
            best <span className="tabular-nums">{best}</span> · {MODES[mode].label}
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="rounded-full bg-white px-5 py-3 text-sm font-medium text-foreground/70 shadow active:scale-95"
            >
              Change mode
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background shadow-lg active:scale-95"
            >
              Play again
            </button>
          </div>
        </div>
      )}
    </>
  );
}
