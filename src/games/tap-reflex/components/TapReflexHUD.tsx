import { ArrowLeft, Crosshair, RotateCcw, Trophy, Volume2, VolumeX, Zap } from "lucide-react";
import { CornerChip, GhostButton, IconButton, PrimaryCTA, StatTile } from "@/games/_shared";
import { ResultModal } from "@/components/platform";
import { ACCENT, ACCENT_SECONDARY, formatTime, getMode, type ModeId } from "../constants";
import type { RunStats, TapPhase } from "../types";

interface Props {
  phase: TapPhase;
  mode: ModeId;
  score: number;
  combo: number;
  bestCombo: number;
  remainingMs: number;
  best: number;
  stats: RunStats;
  soundOn: boolean;
  onBack: () => void;
  onRestart: () => void;
  onChangeMode: () => void;
  onToggleSound: () => void;
}

export function TapReflexHUD({
  phase,
  mode,
  score,
  combo,
  bestCombo,
  remainingMs,
  best,
  stats,
  soundOn,
  onBack,
  onRestart,
  onChangeMode,
  onToggleSound,
}: Props) {
  const cfg = getMode(mode);
  const isNewBest = phase === "over" && stats.score > 0 && stats.score >= best;

  return (
    <>
      {/* Top-left: back + score / combo */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-start gap-2">
        <IconButton label="Back" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
        </IconButton>
        <CornerChip
          label={cfg.label}
          value={score.toLocaleString()}
          sub={
            combo > 1 ? (
              <div
                className="text-[10px] font-bold tabular-nums"
                style={{ color: ACCENT }}
              >
                {combo}× chain
              </div>
            ) : null
          }
        />
      </div>

      {/* Top-right: timer + sound + restart */}
      <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-start gap-2">
        <CornerChip
          label="Time"
          value={formatTime(remainingMs)}
          align="right"
          sub={
            best > 0 ? (
              <div className="text-[10px] tabular-nums text-white/50">
                Best {best.toLocaleString()}
              </div>
            ) : null
          }
        />
        <IconButton label={soundOn ? "Mute" : "Unmute"} onClick={onToggleSound}>
          {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </IconButton>
        <IconButton label="Restart" onClick={onRestart}>
          <RotateCcw className="h-4 w-4" />
        </IconButton>
      </div>

      {phase === "over" && (
        <ResultModal
          accent={ACCENT}
          icon={
            isNewBest ? (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: ACCENT, boxShadow: `0 0 22px ${ACCENT}88` }}
              >
                <Trophy className="h-6 w-6 text-black" strokeWidth={2.5} />
              </div>
            ) : (
              <Crosshair
                className="h-7 w-7"
                style={{ color: ACCENT, filter: `drop-shadow(0 0 6px ${ACCENT}88)` }}
              />
            )
          }
          eyebrow={isNewBest ? "New personal best" : "Time's up"}
          headline={isNewBest ? "Lightning hands." : "Nice reflexes."}
          stats={
            <>
              <StatTile label="Score" value={stats.score.toLocaleString()} accent={ACCENT} />
              <StatTile label="Best" value={Math.max(best, stats.score).toLocaleString()} accent={ACCENT_SECONDARY} />
              <StatTile label="Top chain" value={`${bestCombo}×`} accent={ACCENT} />
              <StatTile label="Accuracy" value={`${stats.accuracy}%`} accent={ACCENT_SECONDARY} />
              <StatTile
                label="Avg reaction"
                value={stats.avgReactionMs > 0 ? `${stats.avgReactionMs}ms` : "—"}
                accent={ACCENT}
              />
              <StatTile label="Hits" value={stats.hits} accent={ACCENT_SECONDARY} />
            </>
          }
          actions={
            <>
              <PrimaryCTA accent={ACCENT} onClick={onRestart} className="col-span-2">
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Zap className="h-4 w-4" strokeWidth={2.6} />
                  Play again
                </span>
              </PrimaryCTA>
              <GhostButton onClick={onChangeMode}>Change mode</GhostButton>
              <GhostButton onClick={onBack}>Home</GhostButton>
            </>
          }
        />
      )}
    </>
  );
}
