import { useNavigate } from "@tanstack/react-router";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants";
import { GameHUD } from "./components/GameHUD";
import { useGameLoop } from "./hooks/useGameLoop";

/**
 * Self-contained Bubble Shooter module.
 *
 * Boundary: this component owns ALL game state via useGameLoop.
 * The app shell only mounts/unmounts it; nothing leaks out.
 */
export function BubbleShooter() {
  const { canvasRef, score, gameOver, restart } = useGameLoop();
  const navigate = useNavigate();

  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#faf6ee]">
      {/* soft ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
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
        score={score}
        gameOver={gameOver}
        onRestart={restart}
        onBack={() => navigate({ to: "/mood/$moodId", params: { moodId: "relax" } })}
      />
    </div>
  );
}

export default BubbleShooter;
