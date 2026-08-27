import { useNavigate } from "@tanstack/react-router";
import { Grid3x3, X as XIcon, Circle } from "lucide-react";
import { GameOverlay } from "@/components/platform";
import { GhostButton, Sfx } from "@/games/_shared";
import { ACCENT, ACCENT_SECONDARY, MODES } from "./constants";
import { TicTacToeHUD } from "./components/TicTacToeHUD";
import { useTicTacToe } from "./hooks/useTicTacToe";

/**
 * Tic-Tac-Toe — Brain Boost.
 * You are X and always move first; the bot answers with weighted-minimax play.
 */
export function TicTacToe() {
  const navigate = useNavigate();
  const api = useTicTacToe();

  const goHome = () => {
    void navigate({ to: "/" });
  };

  return (
    <div
      className="relative h-[100dvh] w-full select-none overflow-hidden"
      style={{
        background: "radial-gradient(120% 80% at 50% 0%, #241d05, #100c02)",
        touchAction: "manipulation",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(44% 30% at 50% 6%, rgba(250,204,21,0.14), transparent 70%), radial-gradient(52% 36% at 50% 100%, rgba(56,189,248,0.08), transparent 70%)",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center p-5">
        <div className="grid aspect-square w-full max-w-[min(88vw,58vh)] grid-cols-3 gap-2.5">
          {api.board.map((mark, i) => {
            const inLine = api.line?.includes(i) ?? false;
            return (
              <button
                key={i}
                type="button"
                aria-label={`Cell ${i + 1}${mark ? `, ${mark}` : ", empty"}`}
                disabled={!!mark || api.phase !== "playing" || api.thinking}
                onClick={() => api.play(i)}
                className="flex items-center justify-center rounded-2xl ring-1 ring-white/10 transition active:scale-[0.97] disabled:active:scale-100"
                style={{
                  background: inLine
                    ? `${ACCENT}22`
                    : "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                  boxShadow: inLine ? `0 0 26px -8px ${ACCENT}` : undefined,
                }}
              >
                {mark === "X" && (
                  <XIcon
                    className="h-1/2 w-1/2"
                    strokeWidth={2.6}
                    style={{ color: ACCENT, filter: `drop-shadow(0 0 8px ${ACCENT}66)` }}
                  />
                )}
                {mark === "O" && (
                  <Circle
                    className="h-[45%] w-[45%]"
                    strokeWidth={2.6}
                    style={{
                      color: ACCENT_SECONDARY,
                      filter: `drop-shadow(0 0 8px ${ACCENT_SECONDARY}55)`,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <TicTacToeHUD
        phase={api.phase}
        mode={api.mode}
        record={api.record}
        outcome={api.outcome}
        thinking={api.thinking}
        soundOn={api.soundOn}
        onBack={goHome}
        onRestart={() => api.start(api.mode)}
        onChangeMode={api.toIntro}
        onToggleSound={api.toggleSound}
      />

      {api.phase === "intro" && (
        <GameOverlay accent={ACCENT}>
          <Grid3x3
            className="mb-3 h-7 w-7"
            style={{ color: ACCENT, filter: `drop-shadow(0 0 6px ${ACCENT}88)` }}
          />
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/65">
            Brain Boost
          </p>
          <h1
            className="mt-1 text-3xl font-bold tracking-tight text-white"
            style={{ textShadow: `0 0 16px ${ACCENT}88` }}
          >
            Tic-Tac-Toe
          </h1>
          <p className="mt-2 max-w-xs text-center text-xs leading-relaxed text-white/55">
            You're X and you always start. Pick how sharp the bot should be.
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
                <div className="text-sm font-bold text-white">{m.label}</div>
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
