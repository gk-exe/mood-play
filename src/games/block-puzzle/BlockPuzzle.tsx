import { useNavigate } from "@tanstack/react-router";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants";
import { BlockPuzzleHUD } from "./components/BlockPuzzleHUD";
import { useBlockPuzzle } from "./hooks/useBlockPuzzle";

/**
 * Block Puzzle — focus / pattern satisfaction module.
 * Self-contained; the shell only mounts it.
 */
export function BlockPuzzle() {
  const navigate = useNavigate();
  const api = useBlockPuzzle();

  return (
    <div
      className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 80% at 50% 0%, #1a1340, #0c0824)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mood-halo"
        style={{
          background:
            "radial-gradient(40% 28% at 50% 6%, rgba(180,138,234,0.22), transparent 70%), radial-gradient(50% 35% at 50% 100%, rgba(95,217,188,0.16), transparent 70%)",
        }}
      />

      <canvas
        ref={api.canvasRef}
        className="relative z-10 rounded-[28px] ring-1 ring-white/10"
        style={{
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          touchAction: "none",
          maxWidth: "100%",
          maxHeight: "100dvh",
          boxShadow: "0 24px 60px -28px rgba(180,138,234,0.55), 0 0 0 1px rgba(180,138,234,0.12)",
        }}
      />

      <BlockPuzzleHUD
        score={api.score}
        best={api.best}
        combo={api.combo}
        bestCombo={api.bestCombo}
        cleared={api.cleared}
        gameOver={api.gameOver}
        soundOn={api.soundOn}
        onBack={() => navigate({ to: "/mood/$moodId", params: { moodId: "brain-boost" } })}
        onRestart={api.restart}
        onToggleSound={api.toggleSound}
      />
    </div>
  );
}

export default BlockPuzzle;
