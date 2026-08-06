# Open-Source Game Integration Workflow

How we bring an existing open-source HTML5/JS game into Vibe Games without
importing its UI, its build system, or its personality.

## 0. Golden rule

**We adopt logic, never chrome.** The original project's rendering, CSS, HUD,
fonts and sounds are discarded. Only the rules/engine survive, rewritten in
TypeScript to fit `docs/GAME_MODULE_STANDARD.md`.

## 1. Vet the source

Checklist before writing any code:

- [ ] License is permissive (MIT / Apache-2.0 / BSD / CC0). **No GPL, no
      "personal use only", no unlicensed repos.**
- [ ] Logic is separable from rendering (or small enough to re-derive).
- [ ] No heavyweight runtime deps (Phaser, Unity export, jQuery). Bundle
      budget stays < 200KB gz per game chunk.
- [ ] No bundled assets we can't relicense (sprites, music, fonts).
- [ ] Game is mobile-playable — touch-first, portrait-friendly.

## 2. Extract the rules

Read the source, then **re-implement** the rules as pure functions in
`src/games/<id>/utils/`. Do not copy-paste DOM code. Pure functions mean the
engine is unit-testable and free of the original's assumptions.

## 3. Wrap in the platform contract

```
src/games/<id>/
├── index.tsx                # export { X as default } from "./Game"
├── Game.tsx                 # shell: background, board, HUD
├── constants.ts             # palette (mood accent), tuning, storage key
├── types.ts
├── hooks/use<X>.ts          # all state + input handling
├── components/<X>HUD.tsx    # composed from @/games/_shared only
└── utils/                   # pure rules ported from the source
```

Required compositions: `CornerChip` / `IconButton` / `StatTile` /
`PrimaryCTA` / `GhostButton` from `@/games/_shared`, `ResultModal` from
`@/components/platform`, `Sfx` for audio, `EASE`/`DURATION` for motion.

## 4. Register

One row in `src/games/registry.ts`. If the game keeps a best score, add its
storage key to `BEST_KEY_MAP` in `src/features/player/useGameStats.ts` so the
home rails can show the trophy pill.

## 5. Attribute

Add a row to the table below and keep the original license text intact in the
ported file's header comment.

## 6. Playtest gate

Same checklist as `CURSOR_PLAYBOOK.md`: 60fps throttled, first input < 2.5s,
no heap growth over 10 minutes, reduced-motion respected, audio toggle
respected, back-to-home works from every state.

---

## Integrated games

| Game | Source project | Author | License | What we took | What we rebuilt |
| --- | --- | --- | --- | --- | --- |
| **2048** (`src/games/twenty48`) | [gabrielecirulli/2048](https://github.com/gabrielecirulli/2048) | Gabriele Cirulli | MIT | Slide/merge traversal rules, spawn probability (90% "2" / 10% "4"), one-merge-per-tile-per-move constraint, game-over detection | Full TypeScript rewrite as pure functions (`utils/board.ts`), React DOM renderer, Satisfaction Lab palette, corner HUD, swipe + keyboard input, procedural SFX, shared celebration overlay |
| **Zombie Survival** (`src/games/zombie-survival`) | [KilledByAPixel/LittleJS](https://github.com/KilledByAPixel/LittleJS) arcade samples | Frank Force | MIT | Fixed-turret survival conventions: ring spawning outside the viewport, geometric difficulty ramp on spawn interval, per-wave speed ramp, tier unlocking, streak-multiplier scoring, particle-burst impact model | Everything else — engine written from scratch as a single-canvas RAF loop (`hooks/useSurvival.ts`), pure rules in `utils/spawn.ts`, Action Rush palette, corner HUD, shared `ResultModal`, procedural SFX. No source files imported |
| **Tap Reflex** (`src/games/tap-reflex`) | [Human Benchmark–style aim/reaction trainers](https://github.com/topics/aim-trainer) — closest reference: [`kirilv/aim-trainer`](https://github.com/topics/aim-trainer) family, MIT-licensed | Various (MIT) | MIT | Reaction-trainer conventions: timed session, random non-overlapping target placement, shrinking target lifetime, reaction-time-weighted scoring, accuracy + average-reaction reporting | Everything else — no files imported. DOM renderer with CSS-driven shrink rings (`Game.tsx`), pure placement/difficulty rules (`utils/spawn.ts`), ref-backed RAF loop (`hooks/useTapReflex.ts`), Quick Hits palette, corner HUD, shared `ResultModal`, procedural SFX |

### 2048 integration notes

- Mood: **Satisfaction Lab** (accent `#5eead4`) — the merge loop is a
  tidying/ordering pleasure, not a raw brain-teaser.
- Rendering is DOM, not canvas: a 4×4 board is 16 nodes, so CSS transitions
  give smoother movement than a RAF canvas loop for less code.
- Tiles carry stable ids so `left`/`top` transitions animate the slide; merges
  reuse the surviving tile's id and play the `scale-in` pop.
- Win state at 2048 offers **Keep going** rather than force-ending the run.
- Best score persists under `twenty48:best:v1`.

### Zombie Survival integration notes

- Mood: **Action Rush** (accent `#e879f9`) — instant-read loop: aim where you
  touch, hold to fire, survive.
- Licensing: LittleJS is MIT. **Zero files were imported** — only the
  rules/conventions listed above were re-derived, so the only obligation is
  the attribution recorded in this table and in the module header comments
  (`Game.tsx`, `utils/spawn.ts`). No bundled assets, no runtime dependency,
  bundle stays well under the 200KB gz budget.
- Rendering is a single full-bleed canvas with a mutable `stateRef`; React
  re-renders only on phase change and a ~10fps HUD snapshot.
- Mobile-first controls: one pointer stream drives both aim and fire
  (`pointerdown` = aim + hold-to-shoot), `touch-action: none`, pointer
  capture so drags off-canvas keep firing. Comfortable one-handed play.
- Feel: muzzle flash, hit flash + spark burst, destruction burst, floating
  score pops, decaying screen shake scaled by streak, haptics on big streaks.
- Difficulty: spawn interval `900ms × 0.985^seconds` (floor 260ms), waves
  every 20s add speed, tiers 2 and 3 unlock at waves 2 and 4.
- Best score persists under `zombie-survival:best:v1` and is bridged into the
  home "Best" pills via `BEST_KEY_MAP`.

#### Files touched

- **Created:** `src/games/zombie-survival/{index.tsx,Game.tsx,constants.ts,types.ts}`,
  `hooks/useSurvival.ts`, `components/SurvivalHUD.tsx`, `utils/spawn.ts`
- **Modified:** `src/games/registry.ts` (status `coming-soon` → `live`,
  lazy loader added), `src/features/player/useGameStats.ts` (`BEST_KEY_MAP`),
  this document
- **Removed:** nothing


### Tap Reflex integration notes

- Mood: **Quick Hits** (accent `#fb923c`) — 40–45 second rounds, understood in
  three seconds: tap the circle before it fades.
- Licensing: only genre conventions were adopted from MIT-licensed reaction
  trainers; **zero files or assets were imported**, so attribution in this
  table is the full obligation. No runtime dependency added.
- Rendering is DOM, not canvas: at most 3–5 targets are alive at a time, so
  React nodes plus CSS keyframes (`vg-tap-in`, `vg-tap-ring`, `vg-tap-pop`,
  `vg-tap-burst` in `src/styles.css`) are cheaper and crisper than a canvas.
  The RAF loop only spawns/expires; the shrink ring is pure CSS.
- Live target list lives in a ref (`liveTargets`); React state is a published
  snapshot, so no side effects run inside a state updater.
- Modes: **Classic** (1×), **Speed Rush** (1.6×, faster spawns), **Precision**
  (2×, 24px targets). Scoring = (10 + 20 × speed factor) × mode multiplier ×
  chain multiplier (capped 3×); a miss or a stray tap costs 5 and breaks the chain.
- Result screen reports score, best, top chain, accuracy %, average reaction
  time and hits, with Play again / Change mode / Home.
- Mobile: `touch-action: none`, pointerdown-driven taps (no click delay),
  targets ≥ 48px across in Classic/Speed, one-handed reachable placement.
- Best score persists under `tap-reflex:best:v1` and is bridged into the home
  "Best" pills via `BEST_KEY_MAP`.

#### Files touched

- **Created:** `src/games/tap-reflex/{index.tsx,Game.tsx,constants.ts,types.ts}`,
  `hooks/useTapReflex.ts`, `components/TapReflexHUD.tsx`, `utils/spawn.ts`
- **Modified:** `src/games/registry.ts` (status `coming-soon` → `live`),
  `src/features/player/useGameStats.ts` (`BEST_KEY_MAP`), `src/styles.css`
  (tap keyframes), this document
- **Removed:** nothing
