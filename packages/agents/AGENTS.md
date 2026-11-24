# AGENTS.md

## Workspace

- This directory is `@toyota/agents`, a private, source-only package inside the pnpm/Turbo workspace at `../..`.
- It may depend only on `@toyota/ai` (`workspace:*`). Do not import from `apps/*`, React, Three.js, or mission/app code. Host-specific pathfinding and movement stay behind `AgentPorts`.
- No build step: `main`, `types`, and `exports` all point at `src/index.ts`.

## Agent constraints

- The agent shall only write code. All scripts are run manually by the user — dev servers, builds, typechecks, tests, linting, formatting, codegen, DB setup/migrations, and seeders. Command sections below are reference only.

## Commands

- `pnpm check-types`, `pnpm test` (vitest with colocated `*.test.ts`), `pnpm format`.
- From the root: `pnpm turbo run test check-types --filter=@toyota/agents`.
- No lint script. Prefer focused `pnpm exec prettier --write <files>` over `pnpm format`, which rewrites all of `src`.

## Architecture

- `src/index.ts` is the public surface: barrels for `contracts`, `nodes`, `intents`, and `trees`.
- `agent.types.ts` defines `AgentConfig`, the discriminated `AgentMovementOrder`/`AgentWeaponOrder` unions, `AgentDecision`, and the per-tick `AgentContext` blackboard. `agents.config.ts` holds the `as const` order/directive/tactic tables and their derived unions; add new tags there, not as ad-hoc strings.
- `contracts/ports.ts` is the only host seam: `resolveFormationMovement(...)` and `findFiringRepositionPoint(...)`. Keep engine math out of nodes and use the helpers in `contracts/geometry.ts` (`distanceXZ`, `headingTo`, `wrapAngle`, `alignmentError`).
- `contracts/decision.ts` provides `createAgentDecision`/`resetAgentDecision` for allocation-free resets. Action nodes mutate `ctx.decision` and return `RUNNING`/`SUCCESS`; they do not return orders.
- `intents/types.ts` defines `AgentIntent` ids and `defineAgentIntent`, which pairs an id with scored `UtilityOption`s and one `AgentTreeDef`. Two options may share an id (OR composition). `intents/options/` holds one file per intent; `intents/registry.ts` assembles all seven intents into eight options.
- `intents/utils.ts` holds reusable consideration helpers; `intents/debug.ts` is the throttled, vitest-free utility debug sink.
- `nodes/node-ids.ts` and `nodes/tree-def.ts` are the registry and typed parameter map for declarative trees. Adding a node means: add a file in `nodes/actions/` or `nodes/conditions/`, an id in `AgentNodes`, params in `AgentNodeParamsMap`, a factory in `nodes/builder.ts`, and a barrel export.
- `trees/utility.ts`: `buildUtilityAgentTree(config, debugSink?, label?)` builds per-intent subtrees, wires momentum/commit timing and `forcedIntent: ctx.squadOrder.forcedIntent`, then wraps them in `BTSelector([ROUT_TREE, utility])`. `ROUT_TREE` always outranks forced intents.
- Use `testing/context.ts` (`testConfig`, `testPorts`, `createTestContext`) as the canonical fixture for tests.

## Gotchas

- `UtilitySelector` and the patrol/flank action nodes hold mutable state, so build one tree per agent. Never share a tree between agents or reuse one across tests.
- `distanceXZ` reads `z` on `Vec3` but `y` on `Vec2`; app squad positions may use `{ x, y: worldZ }`. Convert at the host boundary.
- `PatrolAction` uses `Math.random()` for wait durations; assert ranges and ordering, not exact values.
- `agent.types.ts` and `agents.config.ts` are the current homes for config and context. Do not reintroduce the removed `contracts/agent.ts` or `contracts/config.ts`.
