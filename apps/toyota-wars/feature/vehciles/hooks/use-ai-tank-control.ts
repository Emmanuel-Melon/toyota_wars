// apps/toyota-wars/feature/vehciles/hooks/use-ai-tank-control.ts
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RapierRigidBody } from "@react-three/rapier";
import { WRECK_LOOT, type WreckRegistry } from "@/lib/combat/wreck.registry";
import { COMBAT_CONFIG } from "@/lib/combat/combat.config";
import type { Team } from "@/lib/combat/combat.types";
import type { TerrainSampler } from "@/lib/map/map.terrain";
import type { useAITankRuntime } from "@/hooks/use-ai-tank-runtime";

type AITankRuntime = ReturnType<typeof useAITankRuntime>;

type UseAITankControlParams = {
  unitId: string;
  team: Team;
  destroyed: boolean;
  initialPosition: readonly [number, number];
  runtime: AITankRuntime;
  terrain: TerrainSampler;
  wrecks: WreckRegistry;
};

export function useAITankControl({
  unitId,
  team,
  destroyed,
  initialPosition,
  runtime,
  terrain,
  wrecks,
}: UseAITankControlParams) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const registryPosition = useRef(
    new THREE.Vector3(initialPosition[0], 0, initialPosition[1]),
  );

  const bodyAdapter = useRef({
    get position() {
      return registryPosition.current;
    },
    get heading() {
      return runtime.body.heading;
    },
    get speed() {
      return runtime.body.speed;
    },
    step: () => {},
    nudge: (dx: number, dz: number) => {
      runtime.body.nudge(dx, dz);
      registryPosition.current.copy(runtime.body.position);
      rigidBodyRef.current?.setTranslation(
        {
          x: runtime.body.position.x,
          y: runtime.body.position.y,
          z: runtime.body.position.z,
        },
        true,
      );
    },
    reset: (pos: THREE.Vector3) => {
      rigidBodyRef.current?.setTranslation(
        { x: pos.x, y: pos.y, z: pos.z },
        true,
      );
      registryPosition.current.copy(pos);
      runtime.body.reset(pos, 0);
    },
  });

  // Handle Wreck Registration on Destruction
  useEffect(() => {
    if (!destroyed || team !== "enemy") return;

    const position = runtime.body.position;
    const type =
      Math.random() < COMBAT_CONFIG.WRECK_LOOT_AMMO_CHANCE
        ? WRECK_LOOT.AMMO
        : WRECK_LOOT.HEALTH;

    wrecks.register({
      id: unitId,
      team,
      position: new THREE.Vector3(
        position.x,
        terrain.getVehicleHeight(position.x, position.z),
        position.z,
      ),
      loot: {
        type,
        amount:
          type === WRECK_LOOT.AMMO
            ? COMBAT_CONFIG.WRECK_AMMO_REFILL
            : COMBAT_CONFIG.WRECK_HEALTH_REFILL,
      },
    });
  }, [destroyed, team, unitId, wrecks, runtime.body, terrain]);

  return {
    rigidBodyRef,
    registryPosition,
    bodyAdapter: bodyAdapter.current,
  };
}
