import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CANVAS_HEIGHT, CANVAS_WIDTH, MODES } from "./constants";
import { GameHUD } from "./components/GameHUD";
import { useGameLoop } from "./hooks/useGameLoop";
import type { GameMode } from "./types";

const MODE_ORDER: GameMode[] = ["relax", "classic", "challenge"];

/**
 * Self-contained Bubble Shooter module.
 * Owns all game state via useGameLoop. The shell only mounts/unmounts it.
 */
export function BubbleShooter() {
  const [mode, setMode] = useState<GameMode | null>(null);
  const navigate = useNavigate();

  if (!mode) {
    return (
      <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#faf6ee] px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-[bgdrift_18s_ease-in-out_infinite]"
          style={{
            background:
              "radial-gradient(60% 40% at 50% 0%, rgba(180,210,200,0.35), transparent 70%), radial-gradient(60% 40% at 50% 100%, rgba(245,210,190,0.35), transparent 70%)",
          }}
        />
        <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
          <button
            type="button"
            onClick={() => navigate({ to: "/mood/$moodId", params: { moodId: "relax" } })}
            className="absolute -top-2 left-0 text-sm text-foreground/50 active:scale-95"
          >
            ← Back
          </button>
          <p className="mt-10 text-xs uppercase tracking-[0.22em] text-foreground/50">
            Bubble Shooter
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight">Pick a pace</h1>
          <div className="mt-8 flex w-full flex-col gap-3">
            {MODE_ORDER.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="group flex w-full items-center justify-between rounded-2xl bg-white/80 px-5 py-4 text-left shadow-sm backdrop-blur active:scale-[0.98]"
              >
                <div>
                  <div className="text-base font-medium text-foreground">{MODES[m].label}</div>
                  <div className="text-xs text-foreground/55">{MODES[m].blurb}</div>
                </div>
                <span className="text-foreground/30 transition group-active:translate-x-1">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <GameView mode={mode} onExit={() => setMode(null)} />;
}

function GameView({ mode, onExit }: { mode: GameMode; onExit: () => void }) {
  const { canvasRef, score, level, best, gameOver, restart } = useGameLoop(mode);

  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#faf6ee]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-[bgdrift_18s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 0%, rgba(180,210,200,0.35), transparent 70%), radial-gradient(60% 40% at 50% 100%, rgba(245,210,190,0.35), transparent 70%)",
        }}
      />

      <canvas
        ref={canvasRef}
        className="relative z-10 rounded-3xl bg-transparent shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)]"
        style={{
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          touchAction: "none",
          maxWidth: "100%",
          maxHeight: "100dvh",
        }}
      />

      <GameHUD
        mode={mode}
        score={score}
        level={level}
        best={best}
        gameOver={gameOver}
        onRestart={restart}
        onBack={onExit}
      />
    </div>
  );
}

export default BubbleShooter;
