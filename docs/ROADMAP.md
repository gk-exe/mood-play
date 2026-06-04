# Master Development Roadmap & Cursor Handoff

> Phase 4 deliverable. This is a planning document. No code in this phase.
> Companion files in this directory:
> - `GAME_MODULE_STANDARD.md` — mandatory module contract (already authoritative)
> - `BLUEPRINTS.md` — per-game design blueprints
> - `DESIGN_SYSTEM.md` — visual + motion language
> - `CURSOR_PLAYBOOK.md` — day-to-day workflow outside Lovable

---

## 1. Project Audit

### Strengths
- **Single source of truth** for games (`src/games/registry.ts`) and moods (`src/features/moods/data.ts`). Adding content does not require touching the shell.
- **Dynamic host route** `/play/$gameId` with lazy loading + `ComingSoon` fallback. New games can be registered before code exists; broken/unknown ids never dead-end.
- **Shared primitives** (`src/games/_shared/`, `src/components/platform/`) enforce the "sacred playfield" HUD rule and a single celebration/overlay language.
- **Engine pattern proven twice** (Bubble Shooter, Block Puzzle): single canvas + RAF + `stateRef`, zero React re-renders during play.
- **Procedural audio + haptics** (`_shared/audio.ts`) — zero asset weight, instant tactile feedback.
- **Type-only scaffolds** for player, audio, theme — contracts are committed, implementation is deferred without blocking design conversations.

### Weaknesses / Risks
- **No persistence layer.** High scores, settings, mute state all reset on reload. First retention feature will force a storage decision.
- **No automated tests.** Engine math (collision, line clears, combo decay) is the highest-value test target and is currently untested.
- **No analytics hook.** Funnel, retention, and mode-popularity questions cannot be answered today.
- **Two engines, two conventions.** Bubble Shooter and Block Puzzle each invented their own loop/HUD plumbing. A third game would justify extracting a `useCanvasGame` hook to lock the pattern.
- **Bundle growth uncapped.** Lazy chunks help, but there is no per-game size budget or CI check.
- **Accessibility gaps.** No reduced-motion respect, no keyboard input path, no screen-reader labels on canvas surfaces.
- **No error boundary around `<Game />`.** A throw inside a game crashes the shell.
- **Theme engine is types-only.** `THEMES` array has empty `tokens`. Real theme switching will require token migration in `src/styles.css`.

### Fix-before-scale list (do these before games 3–10)
1. Wrap the dynamic host in an error boundary; show `ErrorState` with "Back to home".
2. Add a `localStorage`-backed `useGameStats(gameId)` hook behind the `GameStats` type. One file, no backend.
3. Add Vitest + one happy-path test per engine util (`grid.ts`, `board.ts`, `pieces.ts`).
4. Extract `useCanvasGame({ draw, step, onPointer })` into `_shared/` so game #3 starts at the right altitude.
5. Wire a `prefers-reduced-motion` check into `_shared/anim.ts` and gate particle counts on it.

---

## 2. Implementation Priority Matrix

Scoring 1 (low) → 5 (high). "Reuse" = how much of existing infra carries over.

| # | Game | Complexity | Appeal | Retention | Effort | Reuse | Verdict |
|---|------|------------|--------|-----------|--------|-------|---------|
| 1 | Bubble Shooter | 3 | 5 | 4 | — | — | **Done** |
| 2 | Block Puzzle | 3 | 5 | 5 | — | — | **Done** |
| 3 | Memory Match | 2 | 4 | 3 | 2 | 5 | **Next** — fastest win, validates DOM-based game path |
| 4 | Tap Reflex | 2 | 3 | 3 | 2 | 5 | Cheap; validates micro-session loop |
| 5 | Sorting Master | 3 | 4 | 4 | 3 | 4 | Drag/drop reuses Block Puzzle pointer code |
| 6 | Reaction Challenge | 2 | 3 | 3 | 2 | 5 | Sibling of Tap Reflex; ship together |
| 7 | Endless Runner | 4 | 5 | 5 | 4 | 3 | First game needing a real physics tick + parallax |
| 8 | Word Puzzle | 3 | 4 | 4 | 3 | 3 | Needs a dictionary asset; treat as platform's first "data game" |
| 9 | Chess | 5 | 4 | 5 | 5 | 2 | Needs AI engine — defer until platform has progression |
| 10 | Zombie Survival | 5 | 5 | 4 | 5 | 2 | Most ambitious; reserve for after Endless Runner proves real-time loop |

### Recommended build order
**3 → 4 → 6 → 5 → 7 → 8 → 9 → 10**

Rationale: front-load high-reuse, low-effort games to grow the library fast and validate cross-game systems (stats, sound, themes) on cheap surfaces. Push the two ambitious real-time titles (Runner, Zombie) past the moment when shared infra is mature.

---

## 3. Game-Specific Blueprints

See `docs/BLUEPRINTS.md`. Each entry includes loop, rendering, input, retention, and expansion notes.

---

## 4. Shared System Roadmap

Order is dependency-driven; each system unlocks the next.

| Order | System | Trigger | Depends on |
|-------|--------|---------|------------|
| 1 | **Persistence** (localStorage adapter for `GameStats`, `Settings`, `HighScore`) | Before game #3 ships | — |
| 2 | **Audio settings** (mute toggle wired to `Sfx.setEnabled`) | With #1 | Persistence |
| 3 | **Reduced motion + accessibility pass** | With #1 | — |
| 4 | **Player profile** (display name, avatar, local-only) | After 4 games live | Persistence |
| 5 | **Achievements** | After 5 games live | Profile + Stats |
| 6 | **Statistics dashboard** (`/stats` route) | After 5 games live | Stats |
| 7 | **Onboarding** (first-run mood picker, tap-to-play coach) | Before public launch | Profile |
| 8 | **Theme switcher** (runtime token swap) | After 6 games live | — |
| 9 | **Rewards / unlockables** | After Achievements | Achievements, Themes |
| 10 | **Cloud sync** (Lovable Cloud) | When cross-device demand appears | Profile, Stats |
| 11 | **Leaderboards** | After Cloud sync | Cloud |
| 12 | **Social / friends** | Last; only if leaderboards prove sticky | Cloud |

---

## 5. Monetization Strategy

**Principle:** the core arcade is free, complete, and never gated. Money buys self-expression and convenience, never advantage.

| Tier | What | When |
|------|------|------|
| **Cosmetic themes** | Paid palette/skin packs that swap CSS tokens; no gameplay change | After theme switcher ships |
| **Premium game packs** | Bundles of 3–5 new games sold as a one-time pack | After 8 games live |
| **Optional subscription** | "Arcade+" — all themes, all new games, ad-free, cloud sync | After leaderboards |
| **Rewarded ads (optional)** | Single rewarded video for "continue run" / "extra life" — opt-in, per-session cap | Only if needed for sustainability |
| **Seasonal content** | Limited-time themes and challenges, free for subscribers, cheap for others | Year 2 |

**Hard "no" list:** energy systems, time-gated retries, loot boxes, forced ads between rounds, paywalls on core mechanics, ad walls on launch.

---

## 6. Performance Standards

These are engineering rules, enforceable in code review.

- **Frame rate:** 60fps on a mid-2020 Android (Pixel 4a class). 30fps is a regression.
- **Input latency:** < 50ms from pointer event to first visual response.
- **TTI:** < 2.5s on 4G for the shell; lazy chunks < 200KB gzipped per game.
- **Memory:** < 80MB JS heap during a 10-minute session. No monotonic growth.
- **Particles:** ≤ 24 active sprites per game. Tune down on `prefers-reduced-motion`.
- **Animations:** prefer `transform` + `opacity`. No layout-thrashing properties in the game loop.
- **Audio:** procedurally generated until a real pack ships. If/when assets arrive: total pack < 500KB, lazy-loaded per bucket.
- **Mobile:** 100% touch-first. Hit targets ≥ 44×44px. Test in portrait at 360×640.

---

## 7. Design System Guide

See `docs/DESIGN_SYSTEM.md` for the full language. Summary:

- **Identity:** modern emotional arcade — playful, alive, expressive. Never therapy/wellness aesthetic.
- **Color:** premium-casual palette (rich solids + soft highlights), never neon fatigue. Tokens in `src/styles.css`, accessed via Tailwind classes only — no raw hex in components.
- **Typography:** distinctive display pair, refined body. No Inter/Poppins defaults.
- **Spacing:** generous negative space around the playfield; HUD lives in corners only ("sacred playfield" rule).
- **Motion:** `EASE.pop` for tactile feedback, `EASE.out` for transitions. Celebrations are rewarding, not overstimulating.
- **Mode naming:** emotionally direct ("Easy Pop", "Combo Pop") over abstract ("Mode A").

---

## 8. Cursor Development Playbook

See `docs/CURSOR_PLAYBOOK.md`. Highlights:

- **Workflow:** branch per game (`feat/game-<id>`), PRs reference the registry entry id.
- **Adding a game:** 1 registry row + 1 module folder. No shell changes. If you find yourself editing `routes/` or `components/platform/`, stop and extract into `_shared/` instead.
- **Testing:** Vitest for pure utils (`utils/*.ts`). Manual playtest checklist per game (see playbook).
- **Debugging:** dev-only `/dev/docs` route documents registries; add per-game `?debug` query param convention for engine overlays.
- **Refactor trigger:** the third game asking for the same helper means it belongs in `_shared/`. Two is a coincidence; three is a pattern.

---

## 9. 12-Month Roadmap

| Phase | Months | Focus | Exit criteria |
|-------|--------|-------|---------------|
| **A — Core Games** | 1–4 | Ship Memory Match, Tap Reflex, Reaction, Sorting Master | 6 games live, shared engine extracted |
| **B — Platform Features** | 4–6 | Persistence, stats dashboard, accessibility, error boundary, theme tokens | 6 games + profile + stats route |
| **C — Personalization** | 6–8 | Theme switcher, achievements, onboarding, Endless Runner | 7 games, 5+ themes, achievement system live |
| **D — Community** | 8–10 | Lovable Cloud sync, leaderboards, Word Puzzle | Cloud profiles, weekly leaderboards |
| **E — Monetization** | 10–12 | Cosmetic packs, Arcade+ subscription, Chess + Zombie Survival | 10 games live, monetization soft-launched |

---

## 10. Final Project Status

- **Completion estimate:** ~15% of the 12-month vision. Architecture and 2 of 10 games done.
- **Maturity:** *Foundational* — shell, registry, two reference engines, and shared primitives are production-quality. Persistence, accessibility, and tests are pre-production.
- **Readiness for Cursor handoff:** **High.** The repo can be developed end-to-end without Lovable. The module contract is enforceable and documented.
- **Biggest remaining risks:**
  1. Engine duplication if game #3 ships before `useCanvasGame` is extracted.
  2. First persistence decision happening mid-feature rather than up-front.
  3. Accessibility debt compounding silently.
- **Biggest opportunities:**
  1. The mood-first framing is genuinely differentiated — lean into it in marketing copy and onboarding.
  2. Shared primitives + procedural audio mean each new game costs days, not weeks.
  3. Theme system, once switched on, is a low-effort monetization surface with high perceived value.

Hand off to Cursor with confidence. Resume Lovable for visual iteration on the shell or for spinning up a new game module scaffold.
