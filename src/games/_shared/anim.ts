/**
 * Shared arcade animation tokens.
 *
 * All mini-games should reach for these constants instead of inventing their
 * own timing/easing so the platform feels emotionally consistent.
 *
 * Philosophy: short, soft, satisfying. Never explosive. Never sluggish.
 */

export const EASE = {
  /** Smooth landing — use for entries and reveals. */
  out: "cubic-bezier(0.22, 1, 0.36, 1)",
  /** Gentle in/out — use for overlays and dialogs. */
  inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  /** Soft anticipation — use for celebration pops. */
  pop: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

export const DURATION = {
  micro: 140,
  short: 220,
  base: 320,
  reveal: 460,
  ceremony: 620,
} as const;

/** Standard entry animation for overlays. */
export const OVERLAY_ENTER = `fade-in ${DURATION.base}ms ${EASE.inOut} both`;
/** Standard entry animation for celebration content. */
export const CELEBRATE_ENTER = `scale-in ${DURATION.reveal}ms ${EASE.pop} both`;
