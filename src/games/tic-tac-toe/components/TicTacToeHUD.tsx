import { ArrowLeft, Grid3x3, Trophy, Volume2, VolumeX } from "lucide-react";
import { CornerChip, GhostButton, IconButton, PrimaryCTA, StatTile } from "@/games/_shared";
import { ResultModal } from "@/components/platform";
import { ACCENT, ACCENT_SECONDARY, getMode, type ModeId } from "../constants";
import type { Outcome, Record as GameRecord, TttPhase } from "../types";

interface Props {
  phase: TttPhase;
  mode: ModeId;
  record: GameRecord;
  outcome: Outcome | null;
  thinking: boolean;
  soundOn: boolean;
  onBack: () => void;
  onRestart: () => void;
  onChangeMode: () => void;
  onToggleSound: () => void;
}

const COPY: Record<Outcome, { eyebrow: string; headline: string }> = {
  win: { eyebrow: "You win", headline: "Clean three in a row." },
  loss: { eyebrow: "Bot wins", headline: "It saw that coming." },
  draw: { eyebrow: "Draw", headline: "Nobody blinked." },
};

export function TicTacToeHUD({
  phase,
  mode,
  record,
  outcome,
  thinking,
  soundOn,
  onBack,
  onRestart,
  onChangeMode,
  onToggleSound,
}: Props) {
  const cfg = getMode(mode);
  const copy = outcome ? COPY[outcome] : COPY.draw;

  return (
    <>
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-start gap-2">
        <IconButton label="Back" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
        </IconButton>
        <CornerChip
          label={cfg.label}
          value={`${record.wins}W · ${record.losses}L`}
          sub={
            <div className="text-[10px] font-bold tabular-nums" style={{ color: ACCENT }}>
              {thinking ? "Bot thinking…" : `${record.streak}× streak`}
            </div>
          }
        />
      </div>

      <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-start gap-2">
        <CornerChip label="Best streak" value={record.bestStreak} align="right" />
        <IconButton label={soundOn ? "Mute" : "Unmute"} onClick={onToggleSound}>
          {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </IconButton>
      </div>

      {phase === "over" && (
        <ResultModal
          accent={ACCENT}
          icon={
            outcome === "win" ? (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: ACCENT, boxShadow: `0 0 22px ${ACCENT}88` }}
              >
                <Trophy className="h-6 w-6 text-black" strokeWidth={2.5} />
              </div>
            ) : (
              <Grid3x3
                className="h-7 w-7"
                style={{ color: ACCENT, filter: `drop-shadow(0 0 6px ${ACCENT}88)` }}
              />
            )
          }
          eyebrow={copy.eyebrow}
          headline={copy.headline}
          stats={
            <>
              <StatTile label="Wins" value={record.wins} accent={ACCENT} />
              <StatTile label="Draws" value={record.draws} accent={ACCENT_SECONDARY} />
              <StatTile label="Losses" value={record.losses} accent={ACCENT} />
              <StatTile label="Streak" value={`${record.streak}×`} accent={ACCENT_SECONDARY} />
              <StatTile label="Best streak" value={`${record.bestStreak}×`} accent={ACCENT} />
              <StatTile label="Mode" value={cfg.label} accent={ACCENT_SECONDARY} />
            </>
          }
          actions={
            <>
              <PrimaryCTA accent={ACCENT} onClick={onRestart}>
                Play again
              </PrimaryCTA>
              <GhostButton onClick={onChangeMode}>Change mode</GhostButton>
              <GhostButton onClick={onBack} className="col-span-2">
                Home
              </GhostButton>
            </>
          }
        />
      )}
    </>
  );
}
