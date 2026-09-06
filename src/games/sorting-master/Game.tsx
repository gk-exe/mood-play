import { useNavigate } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";
import { GameOverlay } from "@/components/platform";
import { GhostButton, PrimaryCTA, Sfx } from "@/games/_shared";
import { ACCENT, CAPACITY, LIQUIDS, MODES } from "./constants";
import { SortingMasterHUD } from "./components/SortingMasterHUD";
import { useSortingMaster } from "./hooks/useSortingMaster";
import { isComplete } from "./utils/tubes";

/**
 * Sorting Master — Satisfaction Lab.
 *
 * Water-sort puzzle. Rules re-derived from the MIT-licensed open-source
 * water-sort browser puzzles; rendering, HUD, audio and celebration all use
 * the platform's shared primitives.
 */
export function SortingMaster() {
  const navigate = useNavigate();
  const api = useSortingMaster();

  const goHome = () => {
    void navigate({ to: "/" });
  };

  const tubeCount = api.board.length;
  const columns = tubeCount <= 6 ? tubeCount : Math.ceil(tubeCount / 2);

  return (
    <div
      className="relative h-[100dvh] w-full select-none overflow-hidden"
      style={{
        background: "radial-gradient(120% 80% at 50% 0%, #06201d, #04100f)",
        touchAction: "manipulation",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(44% 30% at 50% 6%, rgba(94,234,212,0.14), transparent 70%), radial-gradient(52% 36% at 50% 100%, rgba(56,189,248,0.08), transparent 70%)",
        }}
      />

      {/* Playfield */}
      <div className="absolute inset-0 flex items-center justify-center px-4 py-24">
        <div
          className="grid w-full max-w-[520px] justify-items-center gap-x-3 gap-y-6"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {api.board.map((tube, i) => {
            const isSelected = api.selected === i;
            const done = isComplete(tube);
            return (
              <button
                key={i}
                type="button"
                aria-label={`Tube ${i + 1}`}
                onClick={() => api.tapTube(i)}
                className="relative flex w-full max-w-[62px] flex-col-reverse justify-start rounded-b-[22px] rounded-t-md p-1 ring-1 transition"
                style={{
                  aspectRatio: "1 / 3.4",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                  boxShadow: isSelected
                    ? `0 0 0 2px ${ACCENT}, 0 14px 30px -18px ${ACCENT}`
                    : "inset 0 0 22px rgba(0,0,0,0.35)",
                  borderColor: "transparent",
                  transform: isSelected ? "translateY(-10px)" : "translateY(0)",
                  transitionDuration: "180ms",
                  outline: "none",
                }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-b-[22px] rounded-t-md ring-1 ring-white/10"
                />
                {tube.map((color, s) => (
                  <span
                    key={s}
                    aria-hidden
                    className="w-full"
                    style={{
                      height: `${100 / CAPACITY}%`,
                      background: LIQUIDS[color % LIQUIDS.length],
                      opacity: 0.92,
                      borderBottomLeftRadius: s === 0 ? 18 : 0,
                      borderBottomRightRadius: s === 0 ? 18 : 0,
                      transition: "height 160ms ease",
                    }}
                  />
                ))}
                {done && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-b-[22px] rounded-t-md"
                    style={{
                      boxShadow: `0 0 18px -4px ${LIQUIDS[tube[0] % LIQUIDS.length]}`,
                      animation:
                        api.justFilled === i ? "scale-in 320ms ease-out" : undefined,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {api.phase === "playing" && (
        <p className="pointer-events-none absolute bottom-16 left-0 right-0 text-center text-[11px] font-medium tracking-wide text-white/35">
          Tap a tube to lift, tap another to pour.
        </p>
      )}

      <SortingMasterHUD
        phase={api.phase}
        score={api.score}
        best={api.best}
        level={api.level}
        moves={api.moves}
        undosLeft={api.undosLeft}
        soundOn={api.soundOn}
        stats={api.stats}
        onBack={goHome}
        onUndo={api.undo}
        onRestartLevel={api.restartLevel}
        onToggleSound={api.toggleSound}
        onNextLevel={api.nextLevel}
        onPlayAgain={() => api.start(api.mode)}
        onChangeMode={api.toIntro}
      />

      {api.phase === "intro" && (
        <GameOverlay accent={ACCENT}>
          <FlaskConical
            className="mb-3 h-7 w-7"
            style={{ color: ACCENT, filter: `drop-shadow(0 0 6px ${ACCENT}88)` }}
          />
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/65">
            Satisfaction Lab
          </p>
          <h1
            className="mt-1 text-3xl font-bold tracking-tight text-white"
            style={{ textShadow: `0 0 16px ${ACCENT}66` }}
          >
            Sorting Master
          </h1>
          <p className="mt-2 max-w-xs text-center text-xs leading-relaxed text-white/55">
            Pour colors between tubes until every tube holds one clean color.
            You can only pour onto a matching color or into empty space.
          </p>

          <div className="mt-6 grid w-64 gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  Sfx.play("tap");
                  api.start(m.id);
                }}
                className="rounded-2xl bg-white/[0.06] px-4 py-3 text-left ring-1 ring-white/10 transition hover:bg-white/[0.1] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-white">{m.label}</span>
                  <span
                    className="text-[10px] font-bold tabular-nums"
                    style={{ color: ACCENT }}
                  >
                    {m.multiplier}×
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] text-white/50">{m.blurb}</div>
              </button>
            ))}
          </div>

          <GhostButton onClick={goHome} className="mt-4 w-64">
            Back to arcade
          </GhostButton>

          {api.best > 0 && (
            <PrimaryCTA
              accent={ACCENT}
              onClick={() => api.start(api.mode)}
              className="mt-2 w-64"
            >
              Quick start · Best {api.best.toLocaleString()}
            </PrimaryCTA>
          )}
        </GameOverlay>
      )}
    </div>
  );
}
