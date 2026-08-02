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

### 2048 integration notes

- Mood: **Satisfaction Lab** (accent `#5eead4`) — the merge loop is a
  tidying/ordering pleasure, not a raw brain-teaser.
- Rendering is DOM, not canvas: a 4×4 board is 16 nodes, so CSS transitions
  give smoother movement than a RAF canvas loop for less code.
- Tiles carry stable ids so `left`/`top` transitions animate the slide; merges
  reuse the surviving tile's id and play the `scale-in` pop.
- Win state at 2048 offers **Keep going** rather than force-ending the run.
- Best score persists under `twenty48:best:v1`.
