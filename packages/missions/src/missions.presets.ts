// apps/toyota-wars/lib/missions/definition/mission.presets.ts
import { SQUAD_EFFECT_TYPE } from "./missions.config";
import type { SquadEffectInput } from "./missions.types";

/**
 * Reusable effect sets for squads. Pure data, so mission files stay short:
 *
 *   { id: "wave-1", team: "enemy", ...waveEffects(), units: [...] }
 *
 * Functions (not constants) so every squad gets its own arrays.
 */

export interface SquadEffectSet {
  onSpawned: SquadEffectInput[];
  onDestroyed: SquadEffectInput[];
}

/** No notices, no healing. */
export function noEffects(): SquadEffectSet {
  return { onSpawned: [], onDestroyed: [] };
}

/**
 * Classic wave behaviour: announce the wave, and on wipe restore the player's
 * hull and announce what's next. Enemy squads that omit onSpawned/onDestroyed
 * get this by default (see SquadSchema), so existing missions keep working.
 */
export function waveEffects(): SquadEffectSet {
  return {
    onSpawned: [
      {
        type: SQUAD_EFFECT_TYPE.NOTICE,
        title: "WAVE {wave} INCOMING",
        detail: "{count} OPPONENTS",
      },
    ],
    onDestroyed: [
      { type: SQUAD_EFFECT_TYPE.RESTORE_HULL },
      {
        type: SQUAD_EFFECT_TYPE.NOTICE,
        title: "WAVE {wave} COMPLETE",
        detail: "HULL RESTORED · NEXT: {next} OPPONENTS",
        finalDetail: "HULL RESTORED · ALL WAVES CLEARED",
      },
    ],
  };
}
