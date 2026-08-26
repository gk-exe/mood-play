import { useNavigate } from "@tanstack/react-router";

import { GameOverlay } from "@/components/platform";
import { PrimaryCTA } from "@/games/_shared";
import { ACCENT } from "./constants";
import { SurvivalHUD } from "./components/SurvivalHUD";
import { useSurvival } from "./hooks/useSurvival";

/**
 * Survival Rush — Action Rush module.
 *
 * A fixed-turret arcade survival shooter: aim with pointer/touch, hold to
 * fire, outlast the horde. Spawn/difficulty conventions were re-derived from
 * the MIT-licensed LittleJS arcade samples (Frank Force / KilledByAPixel);
 * all rendering, HUD, audio and ceremony use Vibe Games' shared primitives.
 * See docs/OPEN_SOURCE_INTEGRATION.md.
 */
export function SurvivalRush() {
  const navigate = useNavigate();
  const api = useSurvival();

  return (
    <div
      className="relative h-[100dvh] w-full overflow-hidden select-none"
      style={{ background: "radial-gradient(120% 80% at 50% 0%, #1a0a2e, #08040f)" }}
    >
      <canvas
        ref={api.canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ touchAction: "none" }}
        onPointerDown={api.onPointerDown}
        onPointerMove={api.onPointerMove}
        onPointerUp={api.stopFiring}
        onPointerCancel={api.stopFiring}
        onPointerLeave={api.stopFiring}
      />

      <SurvivalHUD
        stats={api.stats}
        best={api.best}
        phase={api.phase}
        isNewBest={api.isNewBest}
        soundOn={api.soundOn}
        onBack={() => navigate({ to: "/" })}
        onHome={() => navigate({ to: "/" })}
        onBrowse={() => navigate({ to: "/mood/$moodId", params: { moodId: "action-rush" } })}
        onRestart={api.start}
        onToggleSound={api.toggleSound}
      />

      {api.phase === "intro" && (
        <GameOverlay accent={ACCENT}>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/60">
            Action Rush
          </p>
          <h1
            className="mt-1 text-3xl font-bold tracking-tight text-white"
            style={{ textShadow: `0 0 18px ${ACCENT}88` }}
          >
            Survival Rush
          </h1>
          <p className="mt-3 max-w-[15rem] text-center text-sm leading-relaxed text-white/65">
            Aim where you touch. Hold to fire. Don&apos;t let anything reach you.
          </p>
          <PrimaryCTA accent={ACCENT} onClick={api.start} className="mt-6 w-44">
            Start the run
          </PrimaryCTA>
        </GameOverlay>
      )}
    </div>
  );
}
