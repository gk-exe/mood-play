import type { ReactNode } from "react";
import { CELEBRATE_ENTER, DURATION, EASE } from "./anim";

interface CelebrationOverlayProps {
  /** Accent hex for the subtle radial wash. */
  accent: string;
  /** Optional ceremonial icon (e.g., Trophy / Sparkles). */
  icon?: ReactNode;
  /** Tiny uppercase eyebrow line. */
  eyebrow: string;
  /** Big headline — keep it 1-2 words. */
  headline: string;
  /** Stat grid row. */
  stats?: ReactNode;
  /** Action row. */
  actions?: ReactNode;
}

/**
 * Shared end-of-round overlay used by every mini-game.
 *
 * Tone: calm, ceremonial, rewarding. No confetti storm, no oversized text.
 * Smooth fade + soft scale, single accent wash, then static.
 */
export function CelebrationOverlay({
  accent,
  icon,
  eyebrow,
  headline,
  stats,
  actions,
}: CelebrationOverlayProps) {
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6"
      style={{
        background: `radial-gradient(72% 50% at 50% 42%, ${accent}1a, rgba(0,0,0,0.74) 72%)`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        animation: `fade-in ${DURATION.reveal}ms ${EASE.inOut} both`,
      }}
    >
      <div
        className="relative z-10 flex flex-col items-center"
        style={{ animation: CELEBRATE_ENTER }}
      >
        {icon ? <div className="mb-3">{icon}</div> : null}
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/65">
          {eyebrow}
        </p>
        <h2
          className="mt-1 text-3xl font-bold tracking-tight text-white"
          style={{ textShadow: `0 0 16px ${accent}88` }}
        >
          {headline}
        </h2>
        {stats ? <div className="mt-5 grid w-64 grid-cols-3 gap-1.5">{stats}</div> : null}
        {actions ? <div className="mt-5 grid w-64 grid-cols-2 gap-1.5">{actions}</div> : null}
      </div>
    </div>
  );
}
