import { SQUAD_EFFECT_TYPE } from "../missions.config";
import type { Mission, Squad } from "../missions.types";
import { enemyWaveNumber, setNotice, type MissionRun } from "./mission.run";
import { nextUnspawnedEnemySquad } from "./mission.triggers";

export type MissionEffect =
  { type: "spawnSquad"; squadId: string } | { type: "resetPlayerHealth" };

export type SquadEffectPhase = "spawned" | "destroyed";

export function squadEffects(
  run: MissionRun,
  mission: Mission,
  squad: Squad,
  phase: SquadEffectPhase,
): MissionEffect[] {
  const authored = phase === "spawned" ? squad.onSpawned : squad.onDestroyed;
  const effects: MissionEffect[] = [];

  for (const effect of authored) {
    switch (effect.type) {
      case SQUAD_EFFECT_TYPE.RESTORE_HULL:
        effects.push({ type: "resetPlayerHealth" });
        break;
      case SQUAD_EFFECT_TYPE.NOTICE: {
        const next = nextUnspawnedEnemySquad(run, mission, squad.id);
        const vars: Record<string, string> = {
          wave: String(enemyWaveNumber(mission, squad.id)),
          count: String(squad.units.length),
          next: String(next?.units.length ?? 0),
        };
        const detail =
          !next && effect.finalDetail !== undefined
            ? effect.finalDetail
            : effect.detail;
        setNotice(
          run,
          interpolate(effect.title, vars),
          interpolate(detail, vars),
        );
        break;
      }
    }
  }
  return effects;
}

export function onSquadSpawned(
  run: MissionRun,
  mission: Mission,
  squadId: string,
): MissionEffect[] {
  const squad = mission.squads.find((s) => s.id === squadId);
  return squad ? squadEffects(run, mission, squad, "spawned") : [];
}

function interpolate(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (whole, key: string) => vars[key] ?? whole);
}
