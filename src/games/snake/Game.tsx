import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Worm } from "lucide-react";
import { GameOverlay } from "@/components/platform";
import { GhostButton, PrimaryCTA, Sfx } from "@/games/_shared";
import { ACCENT, MODES } from "./constants";
import { SnakeHUD } from "./components/SnakeHUD";
import { useSnake } from "./hooks/useSnake";

const SWIPE_THRESHOLD = 24;

/**
 * Snake — Quick Hits.
 * Swipe (or arrow keys) to steer, eat, grow, don't bite yourself.
 */
export function Snake() {
  const navigate = useNavigate();
  const api = useSnake();
  const startPt = useRef<{ x: number; y: number } | null>(null);

  const goHome = () => {
    void navigate({ to: "/" });
  };

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    startPt.current = { x: e.clientX, y: e.clientY };
  };

  const onUpOrMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = startPt.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;
    startPt.current = null;
    if (Math.abs(dx) > Math.abs(dy)) api.turn(dx > 0 ? "right" : "left");
    else api.turn(dy > 0 ? "down" : "up");
  };

  const cells = api.cols;
  const cellPct = 100 / cells;
  const headKey = `${api.snake[0]?.x},${api.snake[0]?.y}`;

  return (
    <div
      className="relative h-[100dvh] w-full select-none overflow-hidden"
      style={{
        background: "radial-gradient(120% 80% at 50% 0%, #06210f, #04120a)",
        touchAction: "none",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(44% 30% at 50% 6%, rgba(74,222,128,0.14), transparent 70%), radial-gradient(52% 36% at 50% 100%, rgba(56,189,248,0.09), transparent 70%)",
        }}
      />

      {/* Playfield */}
      <div
        className="absolute inset-0 flex items-center justify-center p-4"
        onPointerDown={onDown}
        onPointerMove={onUpOrMove}
        onPointerUp={onUpOrMove}
      >
        <div
          className="relative aspect-square w-full max-w-[min(92vw,60vh)] overflow-hidden rounded-3xl ring-1 ring-white/10"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
            boxShadow: "inset 0 0 40px rgba(0,0,0,0.45)",
          }}
        >
          {/* Food */}
          <span
            aria-hidden
            className="absolute rounded-full"
            style={{
              left: `${api.food.x * cellPct}%`,
              top: `${api.food.y * cellPct}%`,
              width: `${cellPct}%`,
              height: `${cellPct}%`,
              padding: 2,
              background: "radial-gradient(circle at 35% 30%, #fda4af, #f43f5e)",
              boxShadow: "0 0 14px -2px #f43f5eaa",
              transform: "scale(0.72)",
            }}
          />

          {/* Snake */}
          {api.snake.map((c, i) => {
            const isHead = `${c.x},${c.y}` === headKey && i === 0;
            const t = i / Math.max(1, api.snake.length);
            return (
              <span
                key={`${c.x}-${c.y}-${i}`}
                aria-hidden
                className="absolute"
                style={{
                  left: `${c.x * cellPct}%`,
                  top: `${c.y * cellPct}%`,
                  width: `${cellPct}%`,
                  height: `${cellPct}%`,
                  borderRadius: isHead ? "34%" : "28%",
                  transform: `scale(${isHead ? 0.98 : 0.9})`,
                  background: isHead
                    ? "linear-gradient(160deg, #bbf7d0, #4ade80)"
                    : `rgba(74,222,128,${0.85 - t * 0.45})`,
                  boxShadow: isHead ? `0 0 16px -3px ${ACCENT}` : undefined,
                }}
              />
            );
          })}
        </div>
      </div>

      <SnakeHUD
        phase={api.phase}
        mode={api.mode}
        score={api.score}
        length={api.length}
        best={api.best}
        stats={api.stats}
        soundOn={api.soundOn}
        onBack={goHome}
        onTogglePause={api.togglePause}
        onRestart={() => api.start(api.mode)}
        onChangeMode={api.toIntro}
        onToggleSound={api.toggleSound}
      />

      {api.phase === "paused" && (
        <GameOverlay accent={ACCENT}>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/65">
            Paused
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white">Take your time.</h2>
          <PrimaryCTA accent={ACCENT} onClick={api.togglePause} className="mt-6 w-44">
            Resume
          </PrimaryCTA>
          <GhostButton onClick={goHome} className="mt-2 w-44">
            Home
          </GhostButton>
        </GameOverlay>
      )}

      {api.phase === "intro" && (
        <GameOverlay accent={ACCENT}>
          <Worm
            className="mb-3 h-7 w-7"
            style={{ color: ACCENT, filter: `drop-shadow(0 0 6px ${ACCENT}88)` }}
          />
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/65">
            Quick Hits
          </p>
          <h1
            className="mt-1 text-3xl font-bold tracking-tight text-white"
            style={{ textShadow: `0 0 16px ${ACCENT}88` }}
          >
            Snake
          </h1>
          <p className="mt-2 max-w-xs text-center text-xs leading-relaxed text-white/55">
            Swipe anywhere to steer — arrow keys work too. Every bite makes you
            longer and a little faster.
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
                className="rounded-2xl bg-white/[0.06] px-4 py-3 text-left ring-1 ring-white/10 transition active:scale-[0.98] hover:bg-white/[0.1]"
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
        </GameOverlay>
      )}
    </div>
  );
}
