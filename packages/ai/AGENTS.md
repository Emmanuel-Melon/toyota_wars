# AGENTS.md

## Workspace

- This directory is `@toyota/ai`, a private, source-only package inside the pnpm/Turbo workspace at `../..`.
- Pure decision logic with no runtime dependencies. Do not import from `apps/*`, `@toyota/agents`, React, Three.js, or any engine/domain package.
- `@toyota/agents` consumes this package; the game app consumes that. Mission views in `src/director/mission-directive.types.ts` must stay neutral (`{ x, z }`, no engine types).
- No build step: `main`, `types`, and `exports` all point at `src/index.ts`.

## Commands

- `pnpm check-types`, `pnpm test` (vitest with colocated `*.test.ts`), `pnpm format`.
- From the root: `pnpm turbo run test check-types --filter=@toyota/ai`.
- No lint script. Prefer focused `pnpm exec prettier --write <files>` over `pnpm format`, which rewrites all of `src`.

## Architecture

- `src/index.ts` is the public surface: barrels for `behavior-trees`, `utility`, `config`, and `director`. Add new modules there.
- `behavior-trees/core.ts`: `BTNode.evaluate` returns `NodeState` (`SUCCESS`, `FAILURE`, `RUNNING`); selectors stop at the first non-`FAILURE`, sequences at the first non-`SUCCESS`.
- `behavior-trees/utility-selector.ts`: `forcedIntent` short-circuits scoring; on child `FAILURE`, other options are retried in descending raw score (positive scores only) unless `fallbackOnFailure: false`. Selector memory is mutable: one instance per evaluated entity.
- `utility/scoring.ts`: considerations are clamped to `0..1` and multiplied; any zero vetoes the option. Compensation softens the multi-factor penalty. Duplicate option ids keep the highest raw score, which is how two options compose one intent.
- `utility/selector.ts`: commitment keeps the incumbent while its raw score is positive and `now - since < minCommitMs`; `momentumBonus` favors the incumbent and `selectionNoise` perturbs the rest. Defaults are 600 ms, 0.15, and no noise. No options throws.
- `config/difficulty.ts`: `DIFFICULTY` presets pair capability flags with reaction tuning. Use `selectorReactionConfig(preset)` instead of hardcoding noise/commit/momentum values.
- `director/squad-director.ts` is a pure `deriveSquadDirectives(view)`. Non-active missions yield `hold`/no-target for everyone. Objectives are ranked required goals, then optional goals, then constraints; only spawned/alive squads of the acting team are assigned, with deterministic id tie-breaks. Returned directives, targets, and flags are frozen; use `directivesEqual` for structural comparison. Helpers live in `director.utils.ts`, `need-resolver.ts`, and `squad-assignment.ts`.

## Gotchas

- `performance.now()` is the default clock; pass an explicit clock/`now` in tests that need determinism.
- `selectionNoise` calls `Math.random()`; keep noise out of exact-value assertions.
- `Vec2` here is `{ x, z }`; other packages may use `{ x, y }`. Convert at the host boundary, do not mix shapes.
- Avoid re-exporting internal helpers from `src/index.ts` just to satisfy a caller; keep the package surface generic.
