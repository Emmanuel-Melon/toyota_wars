"use client";

import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { ConstantValue } from "three.quarks";
import { useVehicleContext } from "@/context/vehicle-context";
import { useFxEvent } from "@/context/fx-context";
import { COMBAT_CONFIG } from "@/lib/combat/combat.config";
import { useGameFrame } from "@/render-loop";
import {
  createDamageSmoke,
  useDamageSmokeMaterial,
} from "../damage-smoke-recipe";
import { placeSystem } from "../fx-utils";
import { useQuarksSystem } from "../../../context/quarks-provider";

const HOOD_SMOKE_POSITION: [number, number, number] = [0, 0.95, 1.9];
const POSITION = new THREE.Vector3();

export function VehicleDamageSmokeFx() {
  const { unitId, health, maxHealth, wrecked, destructionActive } =
    useVehicleContext();
  const markerRef = useRef<THREE.Group>(null);
  const material = useDamageSmokeMaterial();
  const createSystem = useCallback(
    () => createDamageSmoke(material),
    [material],
  );
  const system = useQuarksSystem(createSystem, [createSystem]);

  const isPlayer = unitId === COMBAT_CONFIG.PLAYER_ID;
  const threshold = COMBAT_CONFIG.PLAYER_DAMAGE_SMOKE_HEALTH_FRACTION;
  const ratio = Math.max(0, Math.min(1, health / maxHealth));
  const severity =
    ratio <= threshold ? 0.25 + 0.75 * ((threshold - ratio) / threshold) : 0;
  const active = isPlayer && severity > 0 && !wrecked && !destructionActive;

  useEffect(() => {
    if (!system) return;
    if (!active) {
      system.stop();
      return;
    }
    system.restart();
  }, [system, active]);

  useEffect(() => {
    if (!system || !active) return;
    (system.emissionOverTime as ConstantValue).value = 8 + severity * 16;
    system.emitter.scale.setScalar(0.7 + severity * 0.7);
  }, [system, active, severity]);

  useFxEvent("clear", () => system?.stop());

  useGameFrame(() => {
    if (!system || !active) return;
    const marker = markerRef.current;
    if (!marker) return;
    marker.getWorldPosition(POSITION);
    placeSystem(system, POSITION);
  }, "vfx");

  if (!isPlayer) return null;

  return <group ref={markerRef} position={HOOD_SMOKE_POSITION} />;
}

export function PlayerDamageSmokeFx() {
  const { unitId } = useVehicleContext();
  return unitId === COMBAT_CONFIG.PLAYER_ID ? <VehicleDamageSmokeFx /> : null;
}
