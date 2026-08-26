# Game Blueprints

Design-only. No implementation in this document. Each game follows the
module standard in `GAME_MODULE_STANDARD.md`.

---

## Bubble Shooter — `live`
- **Loop:** aim → shoot → match-3+ pops → chain → mode-specific goal.
- **Architecture:** single canvas, RAF loop, mutable `stateRef`. Grid in `utils/grid.ts`, physics in `utils/physics.ts`.
- **Rendering:** specular-highlighted bubbles, selective glow on shooter pulse/impact.
- **Input:** touch-and-drag aim, release to fire. Aim line as guidance.
- **Retention:** four modes (Easy Pop, Combo Pop, Pop Rush, Endless Pop), per-mode best score, combo streaks.
- **Progression hooks:** combo-based achievements, color-blind palette unlocks, seasonal bubble skins.
- **Future:** power-ups (rainbow ball, bomb), daily challenge seed.

## Block Puzzle — `live`
- **Loop:** pick from tray → drag → snap → clear lines → combo.
- **Architecture:** canvas + tray DOM hybrid; `useBlockPuzzle.ts` holds RAF + pointer capture.
- **Rendering:** lifted ghost preview, magnetic snap, decaying combo flash.
- **Input:** pointer with `DRAG_LIFT` offset so finger never covers the piece.
- **Retention:** combo multiplier, run high score, game-over detection via `anyPieceFits`.
- **Progression hooks:** weekly seeds, themed piece palettes, "perfect clear" achievement.
- **Future:** larger boards (10x10), timed mode, multi-color objectives.

## Memory Match — `coming-soon` *(next)*
- **Loop:** flip → match → clear board → next level (more pairs).
- **Architecture:** **DOM/React** (no canvas) — proves the platform supports non-canvas games via shared HUD/overlays.
- **Rendering:** CSS 3D flip, staggered entrance, subtle glow on match.
- **Input:** tap to flip, two-card lockout window.
- **Retention:** levels with growing grids (4→6→8 pairs), best time per level, perfect-memory streak.
- **Progression hooks:** card-back themes, mood-based card art sets.
- **Future:** multiplayer turn-based, themed packs (animals, planets, retro icons).

## Tap Reflex — `coming-soon`
- **Loop:** wait for cue → tap → score reaction window → repeat for N rounds.
- **Architecture:** DOM-based, RAF for cue timing.
- **Rendering:** full-bleed color change as cue; single centered numeric.
- **Input:** anywhere-tap; penalize early taps.
- **Retention:** best average ms, daily streak.
- **Progression hooks:** difficulty curves (false starts, color discrimination).
- **Future:** head-to-head async mode.

## Reaction Challenge — `coming-soon`
- **Loop:** multi-target reflex variant of Tap Reflex with directional/color cues.
- **Architecture:** shared with Tap Reflex; ship as siblings.
- **Rendering:** four quadrants pulse independently.
- **Input:** tap correct quadrant; wrong = -score.
- **Retention:** survival mode, escalating tempo.
- **Future:** Simon-says variant, audio cues for accessibility.

## Sorting Master — `coming-soon`
- **Loop:** colored items spawn → sort into bins → avoid overflow.
- **Architecture:** canvas + drag pointer code from Block Puzzle.
- **Rendering:** soft physics on items, bin "satisfied" animation per correct drop.
- **Input:** drag-and-drop; bin-snap zones.
- **Retention:** ASMR-style click rewards, increasing item velocity.
- **Future:** themed sets (laundry, recycling, library).

## Endless Runner — `coming-soon`
- **Loop:** auto-run → tap to jump/slide → dodge → distance score.
- **Architecture:** first game needing real physics tick + parallax layers. Extract `useCanvasGame` before starting.
- **Rendering:** 3-layer parallax, particle dust on landing, screen-shake on near-miss.
- **Input:** tap (jump), swipe down (slide).
- **Retention:** distance milestones, daily seed, character unlocks.
- **Future:** character abilities, themed worlds.

## Word Puzzle — `coming-soon`
- **Loop:** letter grid → swipe to form word → validate → score.
- **Architecture:** DOM-based; first game shipping a real **data asset** (dictionary). Plan lazy-loading and licensing now.
- **Rendering:** swipe trail, valid-word celebration, found-words ribbon.
- **Input:** swipe across adjacent letters.
- **Retention:** daily puzzle, found-words completion %.
- **Future:** themed dictionaries, multiplayer races.

## Chess — `coming-soon`
- **Loop:** standard chess vs AI.
- **Architecture:** DOM-based board; bundled AI engine (e.g. Stockfish WASM). Largest bundle; lazy-load aggressively.
- **Rendering:** flat 2D board, premium piece set, last-move highlight, threat overlay.
- **Input:** tap-tap to move with legal-move dots.
- **Retention:** ELO progression, puzzle-of-the-day.
- **Future:** opening trainer, async online matches.

## Survival Rush — `coming-soon`
- **Loop:** waves of enemies → aim/shoot → upgrade between waves → outlast.
- **Architecture:** most ambitious; real-time loop with spawn manager, projectile pool, collision broadphase. Build only after Endless Runner proves the real-time pattern.
- **Rendering:** top-down canvas, particle blood/dust, screen shake on hit.
- **Input:** twin-stick on touch (move thumb / aim thumb).
- **Retention:** wave count, weapon unlocks, daily survival seed.
- **Future:** boss waves, co-op (post-Cloud sync).
