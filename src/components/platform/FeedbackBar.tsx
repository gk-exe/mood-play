import { useState } from "react";
import { Heart, MessageCircleWarning, ThumbsDown, Check } from "lucide-react";
import { recordReaction, type Reaction } from "@/features/feedback/store";

interface Props {
  gameId: string;
  accent?: string;
}

/**
 * Lightweight, no-account feedback strip dropped under any game / page.
 * Stores reactions in localStorage today; trivial to swap for an API later.
 */
export function FeedbackBar({ gameId, accent = "#a78bfa" }: Props) {
  const [sent, setSent] = useState<Reaction | null>(null);

  function send(reaction: Reaction) {
    recordReaction(gameId, reaction);
    setSent(reaction);
  }

  return (
    <div
      className="mx-auto flex w-full max-w-xs items-center justify-between gap-2 rounded-2xl bg-white/[0.04] p-2 ring-1 ring-white/10 backdrop-blur"
      role="group"
      aria-label="How did this feel?"
    >
      {sent ? (
        <div className="flex w-full items-center justify-center gap-2 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">
          <Check className="h-3.5 w-3.5" style={{ color: accent }} />
          Got it — thanks for the signal.
        </div>
      ) : (
        <>
          <ReactionBtn
            label="Love it"
            icon={<Heart className="h-3.5 w-3.5" />}
            accent={accent}
            onClick={() => send("love")}
          />
          <ReactionBtn
            label="Could be better"
            icon={<ThumbsDown className="h-3.5 w-3.5" />}
            accent={accent}
            onClick={() => send("meh")}
          />
          <ReactionBtn
            label="Report issue"
            icon={<MessageCircleWarning className="h-3.5 w-3.5" />}
            accent={accent}
            onClick={() => send("issue")}
          />
        </>
      )}
    </div>
  );
}

function ReactionBtn({
  label,
  icon,
  accent,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/70 transition active:scale-95 hover:bg-white/5"
      style={{ ["--a" as never]: accent }}
    >
      <span
        className="inline-flex h-6 w-6 items-center justify-center rounded-full ring-1 ring-white/10 transition group-hover:text-white"
        style={{ color: accent, background: `${accent}1a` }}
      >
        {icon}
      </span>
      <span className="leading-tight text-center">{label}</span>
    </button>
  );
}
