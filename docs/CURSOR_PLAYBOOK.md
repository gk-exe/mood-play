# Cursor Development Playbook

How to keep building this project in Cursor + GitHub without needing
Lovable for every change.

## Workflow

- **Branches:** `feat/game-<id>`, `feat/<system>`, `fix/<short>`. One game per branch.
- **PRs:** title references the registry id (`feat(game): memory-match — scaffold`). Description links the relevant section of `BLUEPRINTS.md`.
- **Commits:** Conventional Commits. Engine changes get their own commit separate from UI tweaks.

## Folder usage (recap)

```
src/
├── components/platform/   shell + game UI primitives (do not fork per game)
├── features/              data-driven domains (moods, player, audio, theme)
├── games/
│   ├── _shared/           anim, audio, HUD primitives — the contract
│   ├── registry.ts        ONE row per game; only file the shell reads
│   └── <game-id>/         see GAME_MODULE_STANDARD.md
└── routes/                file-based, dot-separated; never edit routeTree.gen.ts
```

## Adding a new game (the short version)

1. Add the row to `src/games/registry.ts` (status: `"coming-soon"` is fine first).
2. Create `src/games/<game-id>/` matching the module standard.
3. `export { Game as default } from "./Game"` in `index.tsx`.
4. Flip `status` to `"live"` when ready.

**If you find yourself editing `routes/` or `components/platform/` to ship a game, stop.** Extract the need into `_shared/` instead.

## Coding standards

- **TypeScript strict.** No `any` without a `// reason:` comment.
- **No raw colors.** Tokens only — see `DESIGN_SYSTEM.md`.
- **No React re-renders inside the game loop.** Mutable `stateRef` + RAF.
- **No new top-level deps without justification.** Bundle budget: < 200KB gz per game chunk.
- **Imports:** `@/...` absolute paths only.

## Testing expectations

- **Vitest** for pure utils under `utils/*.ts`. Engine math is highest-value (line clears, collision, scoring).
- **Manual playtest checklist** per game:
  - 60fps on mid-range Android (Chrome DevTools throttle: 4x CPU, 360×640).
  - First input < 2.5s after route enter.
  - 10-minute session: no heap growth, no listener leaks.
  - `prefers-reduced-motion`: particles + shake disabled.
  - Audio + haptic toggle respected.
  - Back-to-home from any state (pause, game-over, mid-play) works.

## Debugging workflow

- **Engine overlays:** convention is `?debug=1` query param toggles a dev HUD inside the game (fps, state counters). Implement per game.
- **Dev docs:** `/dev/docs` (dev-only) is the live registry/mood/theme inventory.
- **Console hygiene:** no `console.log` in shipped code. Use a `debug(ns)` helper if needed.
- **Source maps:** keep enabled in preview builds; users can paste stack traces directly.

## Refactor strategy

- **Rule of three.** Two games sharing a helper = copy. Three = extract to `_shared/`.
- **Engine extraction.** When game #3 lands, extract `useCanvasGame({ draw, step, onPointer })` from Bubble Shooter + Block Puzzle. Document in `GAME_MODULE_STANDARD.md`.
- **No silent contract changes.** If `_shared/` or `components/platform/` changes API, bump every consumer in the same PR.

## When to come back to Lovable

- Big visual iterations on the shell (home, mood pages).
- Spinning up the **scaffold** of a new game (Lovable is fast at boilerplate).
- Design system rethinks where rendered options help.

Everything else — engine work, refactors, tests, persistence, accessibility — is faster in Cursor.
