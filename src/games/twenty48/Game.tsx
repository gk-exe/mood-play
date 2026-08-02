import { useNavigate } from "@tanstack/react-router";

import { ACCENT, SIZE, tileFontSize, tileStyle } from "./constants";
import { Twenty48HUD } from "./components/Twenty48HUD";
import { use2048 } from "./hooks/use2048";

/**
 * 2048 — Satisfaction Lab module.
 *
 * Game rules adapted from the open-source 2048 by Gabriele Cirulli (MIT),
 * reimplemented in TypeScript. Rendering, HUD, audio and celebration all use
 * the platform's shared primitives — nothing from the original project's UI.
 */
export function Twenty48() {
  const navigate = useNavigate();
  const api = use2048();

  const goBack = () => navigate({ to: "/" });
  const cellPct = 100 / SIZE;

  return (
    <div
      className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden select-none"
      style={{ background: "radial-gradient(120% 80% at 50% 0%, #06201d, #04100f)" }}
    >
      {/* Mood halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 28% at 50% 6%, rgba(94,234,212,0.16), transparent 70%), radial-gradient(50% 35% at 50% 100%, rgba(52,211,153,0.1), transparent 70%)",
        }}
      />

      {/* Board */}
      <div
        className="relative z-10 w-full max-w-[380px] px-5"
        onPointerDown={api.onPointerDown}
        onPointerUp={api.onPointerUp}
        style={{ touchAction: "none" }}
      >
        <div
          className="relative aspect-square w-full rounded-3xl p-2 ring-1 ring-white/10"
          style={{
            background: "rgba(255,255,255,0.03)",
            boxShadow: "0 24px 60px -30px rgba(0,0,0,0.9)",
            opacity: api.phase === "intro" ? 0 : 1,
            transform: api.phase === "intro" ? "scale(0.96)" : "scale(1)",
            transition: "opacity 420ms ease, transform 420ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* Empty cells */}
          <div
            className="grid h-full w-full gap-2"
            style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: SIZE * SIZE }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/[0.035]" />
            ))}
          </div>

          {/* Tiles */}
          <div className="pointer-events-none absolute inset-2">
            {api.tiles.map((tile) => {
              const style = tileStyle(tile.value);
              return (
                <div
                  key={tile.id}
                  className="absolute flex items-center justify-center rounded-2xl font-bold tabular-nums"
                  style={{
                    width: `calc(${cellPct}% - 6px)`,
                    height: `calc(${cellPct}% - 6px)`,
                    left: `calc(${tile.x * cellPct}% + 3px)`,
                    top: `calc(${tile.y * cellPct}% + 3px)`,
                    background: style.bg,
                    color: style.fg,
                    fontSize: tileFontSize(tile.value),
                    boxShadow: style.glow
                      ? `0 0 18px -2px ${style.glow}66, inset 0 1px 0 rgba(255,255,255,0.12)`
                      : "inset 0 1px 0 rgba(255,255,255,0.08)",
                    transition:
                      "left 110ms cubic-bezier(0.22,1,0.36,1), top 110ms cubic-bezier(0.22,1,0.36,1)",
                    animation: tile.merged
                      ? "scale-in 180ms cubic-bezier(0.34,1.56,0.64,1)"
                      : tile.spawned
                        ? "fade-in 180ms ease-out"
                        : undefined,
                  }}
                >
                  {tile.value}
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] font-medium tracking-wide text-white/35">
          Swipe or use arrow keys — merge matching tiles.
        </p>
      </div>

      {/* Intro flash */}
      {api.phase === "intro" && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <p
            className="text-xs font-bold uppercase tracking-[0.34em] text-white/80"
            style={{ textShadow: `0 0 14px ${ACCENT}88`, animation: "fade-in 320ms ease both" }}
          >
            Merge it
          </p>
        </div>
      )}

      <Twenty48HUD
        score={api.score}
        best={api.best}
        highest={api.highest}
        combo={api.combo}
        phase={api.phase}
        isNewBest={api.isNewBest}
        soundOn={api.soundOn}
        onBack={goBack}
        onRestart={api.restart}
        onKeepPlaying={api.keepPlaying}
        onToggleSound={api.toggleSound}
      />
    </div>
  );
}
