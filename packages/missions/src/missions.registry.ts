import type { z } from "zod";

import type {
  MissionCutsceneDef,
  MissionDefinition,
  MissionQteDef,
  MissionRegistryEntry,
} from "./missions.types";

const missionsById = new Map<string, MissionRegistryEntry>();

export class MissionsRegistry {
  static register<
    TId extends string,
    TCutscene extends MissionCutsceneDef,
    TQte extends MissionQteDef,
    TCustomData,
    TStateSchema extends z.ZodTypeAny,
  >(
    definition: MissionDefinition<
      TId,
      TCutscene,
      TQte,
      TCustomData,
      TStateSchema
    >,
  ): void {
    if (missionsById.has(definition.id)) {
      console.warn(
        `[MissionsRegistry] Overwriting existing mission registration for id "${definition.id}".`,
      );
    }

    missionsById.set(definition.id, {
      id: definition.id,
      definition: definition as unknown as MissionRegistryEntry["definition"],
    });
  }

  static get(missionId: string): MissionRegistryEntry | undefined {
    return missionsById.get(missionId);
  }

  static require(missionId: string): MissionRegistryEntry {
    const entry = missionsById.get(missionId);
    if (!entry) {
      throw new Error(
        `[MissionsRegistry] No mission registered with id "${missionId}". Ensure mission modules are imported during initialization.`,
      );
    }
    return entry;
  }

  static parseState<TStateSchema extends z.ZodTypeAny>(
    missionId: string,
    rawState: unknown,
  ): z.infer<TStateSchema> {
    const { definition } = this.require(missionId);
    return definition.stateSchema.parse(rawState) as z.infer<TStateSchema>;
  }

  static registeredIds(): string[] {
    return Array.from(missionsById.keys());
  }
}
