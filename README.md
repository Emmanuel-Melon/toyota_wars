# Toyota Wars

**Armored squad tactics on the open plains.** Command a column of makeshift war machines, designate targets, and outfight the warband across procedurally generated battlefields.

Toyota Wars is a browser-based tactical combat game where you lead a squad of improvised armored vehicles through mission-based warfare. Every unit fights with its own weapon, personality, and role — and the squad's survival depends on how well you orchestrate them.

## Features

- **Squad command** — issue orders to your warband: attack, follow, hold, or retreat. Allies react to the tactical situation, not just your commands.
- **Missions** — a campaign of objective-driven scenarios: escort convoys, defend positions, eliminate priority targets, and survive escalating waves.
- **Customizable loadouts** — pick your vehicle platform and weapon before each mission. Platforms differ in speed, armor, and durability; weapons range from rapid-fire autocannons to devastating rocket pods.
- **Procedural battlefields** — seeded terrain, roads, and locations mean every mission plays differently.
- **Destructible warfare** — vehicles take part-based damage, leave wrecks, and drop salvage (ammo and repairs) for anyone who can reach them in time.
- **AI that adapts** — enemies and allies use capability-driven tactics: fireteams flank, suppress, bound, and counter-ambush based on local numbers, health, and the mission objective.
- **Spectacle** — particle effects, muzzle flashes, camera work, and scripted mission intros.

## Tech stack

- **Game client** — Next.js 16, React 19, React Three Fiber, Rapier physics
- **Backend** — Express API with Drizzle ORM and PostgreSQL
- **Tooling** — pnpm workspaces + Turborepo

## Repository layout

```
apps/
  toyota-wars/   # the game (Next.js client)
  server/        # Express API — missions, catalog, blueprints
packages/
  client/        # @toyota/client — shared API SDK
```

## Getting started

Requires Node 20+ and pnpm.

```bash
pnpm install
pnpm turbo run dev --filter=toyota-wars   # play the game
```

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — monorepo overview: apps, packages, and how they fit together
- [apps/toyota-wars/docs/](./apps/toyota-wars/docs/) — game internals (providers, selector, squad, utility AI, missions)
- [apps/toyota-wars/ARCHITECTURE.md](./apps/toyota-wars/ARCHITECTURE.md) — client architecture
