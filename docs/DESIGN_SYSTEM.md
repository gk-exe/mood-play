# Design System Guide

The visual + motion language of the Modern Emotional Arcade. Every game
and shell surface must read as part of the same product.

## 1. Identity

- **What it is:** a playful arcade ecosystem — alive, expressive, emotionally energetic.
- **What it is not:** wellness, meditation, productivity, therapy. No "calm" branding.
- **Tone test:** a new user should think *"this looks fun"*, not *"this helps me manage emotions"*.

## 2. Color

- **Source of truth:** `src/styles.css`. All colors are tokens in `oklch`. **Never** write raw hex in components.
- **Tailwind classes only** — `bg-primary`, `text-foreground`, etc. No `bg-[#abc]`.
- **Palette philosophy:** premium-casual. Rich solid bases + soft specular highlights. Avoid fluorescent neon (eye fatigue in long sessions).
- **Mood accents:** each mood category owns one accent token; games inherit via `mood.accent`.
- **Contrast:** all interactive text ≥ WCAG AA against its background, both modes.

## 3. Typography

- **Display:** distinctive, geometric, slightly playful. **No Inter/Poppins.**
- **Body:** refined neutral pairing. Readable at 14px on mobile.
- **Hierarchy:** big bold display for celebration; uppercase tracked micro-labels (`text-[10px] tracking-[0.28em]`) for HUD chrome.

## 4. Spacing

- **Generous around the playfield.** The playfield is sacred — never crowd it.
- **HUD lives in screen corners only.** No central chips, no full-width banners during gameplay.
- **Tap targets ≥ 44×44px.** Always.

## 5. Animation

- **Tokens:** `EASE.pop` (tactile feedback), `EASE.out` (transitions). `DURATION.{fast,base,slow}`. Defined in `src/games/_shared/anim.ts`.
- **Philosophy:**
  - Tactile, not theatrical.
  - One well-timed celebration > ten micro-jitters.
  - Rewarding, never overstimulating.
- **Reduced motion:** respect `prefers-reduced-motion`. Cut particle counts, disable screen shake, swap pops for fades.

## 6. Game Feel

- **Input → response < 50ms.** Always.
- **Every successful action gets feedback** on three channels: visual (pop/flash), audio (`Sfx.*`), haptic (`Sfx.haptic`).
- **Failure feedback is short and kind** — a soft deny tone, no scolding red.
- **Celebrations escalate with achievement.** A first clear and a 10-combo should *feel* different.

## 7. Emotional Design Goals

| Mood category | Feels like | Pace | Palette |
|---------------|-----------|------|---------|
| Chill Zone | Floating, low-stakes | Slow | Cool, soft saturation |
| Brain Boost | Focused, satisfying | Medium | Cool + warm accent |
| Action Rush | Alive, urgent | Fast | Hot, high contrast |
| Satisfaction Lab | ASMR, clean | Medium | Pastel + crisp white |
| Quick Hits | Punchy, snackable | Burst | Single bold accent |

## 8. Component Rules

- **HUD primitives:** `CornerChip`, `IconButton`, `StatTile` from `@/games/_shared/ArcadeHUD`. Do not fork.
- **End-of-round:** `ResultModal` from `@/components/platform`. Do not fork.
- **Pause / intro:** `GameOverlay` from `@/components/platform`. Do not fork.
- **Loading / empty / error:** `LoadingState`, `EmptyState`, `ErrorState` from `@/components/platform`.

The rule: **three games asking for the same helper means it belongs in `_shared/`.**
Two is a coincidence; three is a pattern.
