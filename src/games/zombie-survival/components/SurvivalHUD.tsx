import { ArrowLeft, Crosshair, Flame, Trophy, Volume2, VolumeX } from "lucide-react";

import {
  CornerChip,
  GhostButton,
  IconButton,
  PrimaryCTA,
  StatTile,
} from "@/games/_shared";
import { ResultModal } from "@/components/platform";
import { ACCENT, ACCENT_SECONDARY, formatTime } from "../constants";
import type { SurvivalPhase, SurvivalStats } from "../types";

interface Props {
  stats: SurvivalStats;
  best: number;
  phase: SurvivalPhase;
  isNewBest: boolean;
  soundOn: boolean;
  onBack: () => void;
  onHome: () => void;
  onBrowse: () => void;
  onRestart: () => void;
  onToggleSound: () => void;
}

/** Corner-only HUD + shared end-of-round ceremony for the survival shooter. */
export function SurvivalHUD({
  stats,
  best,
  phase,
  isNewBest,
  soundOn,
  onBack,
  onHome,
  onBrowse,
  onRestart,
  onToggleSound,
}: Props) {
  return (
    <>
      {/* Top-left: back + score + streak */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-start gap-2">
        <IconButton label="Back" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
        </IconButton>
        <CornerChip
          label="Score"
          value={stats.score.toLocaleString()}
          sub={
            stats.streak > 2 ? (
              <div
                className="flex items-center gap-1 text-[10px] font-bold tabular-nums"
                style={{ color: ACCENT }}
              >
                <Flame className="h-3 w-3" /> ×{stats.streak} streak
              </div>
            ) : (
              <div className="text-[10px] font-semibold text-white/45">
                Wave {stats.wave}
              </div>
            )
          }
        />
      </div>

      {/* Top-right: survival timer + sound */}
      <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-start gap-2">
        <CornerChip label="Alive" value={formatTime(stats.timeMs)} align="right" />
        <IconButton label={soundOn ? "Mute" : "Unmute"} onClick={onToggleSound}>
          {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </IconButton>
      </div>

      {/* Bottom-left: best */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-10">
        <CornerChip label="Best" value={best.toLocaleString()} />
      </div>

      {/* Bottom-right: kills */}
      <div className="pointer-events-none absolute bottom-3 right-3 z-10">
        <CornerChip label="Downed" value={stats.kills} align="right" />
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
          eyebrow={isNewBest ? "New best score" : "They got through"}
          headline={isNewBest ? "Personal best." : "Run over."}
          stats={
            <>
              <StatTile label="Alive" value={formatTime(stats.timeMs)} accent={ACCENT} />
              <StatTile label="Score" value={stats.score.toLocaleString()} accent={ACCENT} />
              <StatTile label="Downed" value={stats.kills} accent={ACCENT_SECONDARY} />
              <StatTile label="Best" value={best.toLocaleString()} accent={ACCENT} />
              <StatTile label="Wave" value={stats.wave} accent={ACCENT_SECONDARY} />
              <StatTile
                label="Top streak"
                value={`×${Math.max(stats.streak, 1)}`}
                accent={ACCENT}
              />
            </>
          }
          actions={
            <>
              <PrimaryCTA accent={ACCENT} onClick={onRestart} className="col-span-2">
                Play again
              </PrimaryCTA>
              <GhostButton onClick={onHome}>Home</GhostButton>
              <GhostButton onClick={onBrowse}>Another game</GhostButton>
            </>
          }
        />
      )}
    </>
  );
}
