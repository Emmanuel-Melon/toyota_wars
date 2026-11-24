"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useArena } from "@/context/arena-context";
import { useBattle, useProjectileSystem } from "@/context/battle-context";
import { useCombat } from "@/context/combat-context";
import { useMission } from "@/context/missions.context";
import { useMissionFlow } from "@/feature/mission-flow/mission-flow.context";
import { COMBAT_CONFIG } from "@/lib/combat/combat.config";
import { calculateBallisticPitch } from "@/lib/combat/combat.ballistics";
import { TEAM } from "@toyota/missions";
import { rosterUnitId } from "@/lib/squad/squad.roster";
import { WEAPONS } from "@/lib/weapons/weapon.config";
import { createFireRequest } from "@/lib/weapons/weapon.math";
import {
  ARTILLERY_SQUAD_ID,
  HOLD_THE_LINE_MISSION_ID,
} from "@/lib/missions/data/hold-the-line/mission";
import { EVADE_QTE_ID } from "@/lib/missions/data/hold-the-line/qtes";
import { useGameFrame } from "@/render-loop";

const SHOTS = [
  { at: 0.9, unit: 0, side: 6, forward: -2 },
  { at: 2.1, unit: 1, side: -7, forward: 1 },
  { at: 3.3, unit: 2, side: 5, forward: 3 },
  { at: 4.5, unit: 0, side: -6, forward: -3 },
] as const;

export function Mission2OpeningDirector() {
  const mission = useMission();
  const { phase, qteOutcomes } = useMissionFlow();
  const { registry } = useBattle();
  const { health } = useCombat();
  const projectiles = useProjectileSystem();
  const arena = useArena();
  const elapsedRef = useRef(0);
  const firedRef = useRef(new Set<number>());
  const previousPhaseRef = useRef(phase);
  const missionKey = mission.mission?.id ?? null;

  useEffect(() => {
    elapsedRef.current = 0;
    firedRef.current.clear();
  }, [missionKey, mission.status]);

  useEffect(() => {
    const resumed =
      previousPhaseRef.current !== "gameplay" && phase === "gameplay";
    previousPhaseRef.current = phase;
    if (!resumed) return;

    elapsedRef.current = 0;
    firedRef.current.clear();
  }, [phase]);

  useGameFrame((_, delta) => {
    if (
      phase !== "gameplay" ||
      mission.status !== "active" ||
      mission.mission?.id !== HOLD_THE_LINE_MISSION_ID
    ) {
      return;
    }

    elapsedRef.current += Math.min(Math.max(delta, 0), 0.1);
    const player = registry.get(COMBAT_CONFIG.PLAYER_ID);
    if (!player) return;

    const heading = player.body.heading;
    const rightX = Math.cos(heading);
    const rightZ = -Math.sin(heading);
    const forwardX = Math.sin(heading);
    const forwardZ = Math.cos(heading);
    const weapon = WEAPONS.type63;
    const damageScale = qteOutcomes[EVADE_QTE_ID] === "success" ? 0.05 : 0.15;

    for (let index = 0; index < SHOTS.length; index += 1) {
      const shot = SHOTS[index];
      if (elapsedRef.current < shot.at || firedRef.current.has(index)) continue;

      const unitId = rosterUnitId(TEAM.ENEMY, ARTILLERY_SQUAD_ID, shot.unit);
      const unit = registry.get(unitId);
      if (!unit || (health[unitId] ?? 0) <= 0) continue;

      const x =
        player.position.x + rightX * shot.side + forwardX * shot.forward;
      const z =
        player.position.z + rightZ * shot.side + forwardZ * shot.forward;
      const target = new THREE.Vector3(
        x,
        arena.terrain.getVehicleHeight(x, z) + 0.1,
        z,
      );
      const origin = unit.position.clone();
      const pitch = calculateBallisticPitch(
        origin,
        target,
        weapon.projectile.speed,
        weapon.projectile.gravity ?? 9.81,
      );
      const angle = Math.atan2(target.x - origin.x, target.z - origin.z);
      projectiles.current?.fire(
        createFireRequest(
          origin,
          angle,
          TEAM.ENEMY,
          "type63",
          weapon.spread,
          pitch,
          damageScale,
        ),
      );
      firedRef.current.add(index);
    }
  }, "weapons");

  return null;
}
