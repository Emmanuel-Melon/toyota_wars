"use client";

import { useFrame } from "@react-three/fiber";
import { useCallback, useRef, type RefObject } from "react";
import type * as THREE from "three";
import { useRegisterUnit } from "../../../context/battle-context";
import { useArena } from "@/context/arena-context";
import { usePlayer } from "@/context/player-context";
import { COMBAT_CONFIG } from "@/lib/combat/combat.config";
import { MOVEMENT_CONFIG } from "@/lib/movement/movement.config";
import {
  groundVehicle,
  type ChassisPose,
} from "@/lib/vehicles/vehicle.grounding";
import { updateVehicleMotion } from "@/lib/vehicles/vehicle.motion";

export function PlayerUnit() {
  const { playerBody: body, playerLoadout, destroyed } = usePlayer();
  const nudge = useCallback(
    (dx: number, dz: number) => body.nudge(dx, dz),
    [body],
  );
  useRegisterUnit(
    {
      id: COMBAT_CONFIG.PLAYER_ID,
      team: "ally",
      kind: "player",
      radius: MOVEMENT_CONFIG.body.radius,
      ai: false,
      loadout: playerLoadout,
      body,
      nudge,
    },
    !destroyed,
  );
  return null;
}

/** Copies the canonical player body onto the render group. */
export function PlayerPresenter({
  vehicleRef,
}: {
  vehicleRef: RefObject<THREE.Group | null>;
}) {
  const { playerBody: body, playerMotion: motionRef } = usePlayer();
  const arena = useArena();
  const pose = useRef<ChassisPose>({ pitch: 0, roll: 0 });
  const previousHeading = useRef(body.heading);

  useFrame((_, delta) => {
    const group = vehicleRef.current;
    if (!group) return;
    updateVehicleMotion(motionRef.current, previousHeading, body, delta);
    groundVehicle(
      group,
      body.position,
      body.heading,
      pose.current,
      delta,
      arena.terrain,
    );
  }, 0);

  return null;
}
