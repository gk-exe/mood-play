import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { LEVELS, STAGGER_MS, ACCENT, SYMBOLS } from "./constants";
import { MemoryMatchHUD } from "./components/MemoryMatchHUD";
import { useMemoryMatch } from "./hooks/useMemoryMatch";
import type { Card } from "./types";

function getSymbolColor(char: string): string {
  const found = SYMBOLS.find((s) => s.char === char);
  return found?.color ?? ACCENT;
}

function isFlipped(card: Card, flipped: number[], index: number): boolean {
  return card.matched || flipped.includes(index);
}

/**
 * Memory Match — focus / recall mini-game.
 * DOM-based (no canvas) to prove the platform supports non-canvas modules.
 */
export function MemoryMatch() {
  const navigate = useNavigate();
  const api = useMemoryMatch();
  const config = LEVELS[api.levelIndex];

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
      gridTemplateRows: `repeat(${config.rows}, minmax(0, 1fr))`,
    }),
    [config.cols, config.rows],
  );

  const isInteractive = api.phase === "playing";

  return (
    <div
      className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 80% at 50% 0%, #1e1808, #0f0c04)",
      }}
    >
      {/* Warm mood halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mood-halo"
        style={{
          background:
            "radial-gradient(40% 28% at 50% 6%, rgba(250,204,21,0.18), transparent 70%), radial-gradient(50% 35% at 50% 100%, rgba(251,146,60,0.12), transparent 70%)",
        }}
      />

      {/* Card grid */}
      <div
        className="relative z-10 w-full max-w-[380px] px-5"
        style={{ perspective: "1000px" }}
      >
        <div className="grid gap-2.5" style={gridStyle}>
          {api.cards.map((card, i) => {
            const flipped = isFlipped(card, api.flipped, i);
            const symbolColor = getSymbolColor(card.symbol);
            const delay = i * STAGGER_MS;

            return (
              <div
                key={card.id}
                className="relative aspect-square"
                style={{
                  opacity: api.phase === "idle" ? 0 : 1,
                  transform:
                    api.phase === "idle"
                      ? "translateY(12px) scale(0.92)"
                      : "translateY(0) scale(1)",
                  transition: `opacity 420ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 420ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
                }}
              >
                <button
                  type="button"
                  disabled={!isInteractive || card.matched}
                  onClick={() => api.flipCard(i)}
                  className="absolute inset-0"
                  style={{
                    perspective: "1000px",
                    cursor:
                      isInteractive && !card.matched ? "pointer" : "default",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <div
                    className="relative h-full w-full"
                    style={{
                      transformStyle: "preserve-3d",
                      transition:
                        "transform 520ms cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                  >
                    {/* Card back */}
                    <div
                      className="absolute inset-0 flex items-center justify-center rounded-2xl"
                      style={{
                        backfaceVisibility: "hidden",
                        background:
                          "linear-gradient(135deg, rgba(250,204,21,0.12), rgba(251,146,60,0.06))",
                        border: "1.5px solid rgba(250,204,21,0.18)",
                        boxShadow:
                          "inset 0 1px 0 rgba(255,255,255,0.04)",
                      }}
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ background: "rgba(250,204,21,0.35)" }}
                      />
                    </div>

                    {/* Card front */}
                    <div
                      className="absolute inset-0 flex items-center justify-center rounded-2xl"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        background: card.matched
                          ? "linear-gradient(135deg, rgba(250,204,21,0.08), rgba(251,146,60,0.04))"
                          : "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                        border: card.matched
                          ? `1.5px solid ${ACCENT}40`
                          : "1.5px solid rgba(255,255,255,0.1)",
                        boxShadow: card.matched
                          ? `0 0 20px ${ACCENT}20, inset 0 1px 0 rgba(255,255,255,0.04)`
                          : "inset 0 1px 0 rgba(255,255,255,0.04)",
                        transition: "box-shadow 400ms ease, border-color 400ms ease, background 400ms ease",
                      }}
                    >
                      <span
                        className="text-3xl font-bold select-none"
                        style={{
                          color: symbolColor,
                          textShadow: `0 0 14px ${symbolColor}55`,
                          filter: card.matched ? "brightness(0.75)" : "none",
                          transition: "filter 400ms ease",
                        }}
                      >
                        {card.symbol}
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* HUD */}
      <MemoryMatchHUD
        level={api.currentLevel.level}
        totalLevels={LEVELS.length}
        moves={api.totalMoves}
        streak={api.streak}
        bestStreak={api.bestStreak}
        elapsedMs={api.elapsedMs}
        phase={api.phase}
        bestTotalTime={api.bestTotalTime}
        soundOn={api.soundOn}
        onBack={() =>
          navigate({
            to: "/mood/$moodId",
            params: { moodId: "brain-boost" },
          })
        }
        onRestart={api.restart}
        onToggleSound={api.toggleSound}
      />
    </div>
  );
}

export default MemoryMatch;
