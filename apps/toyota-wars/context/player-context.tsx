"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { type Object3D, Vector3 } from "three";
import { COMBAT_CONFIG } from "@/lib/combat/combat.config";
import { AIM_START, DEFAULT_FALLBACK_AIM_DISTANCE } from "@/lib/aim/aim.config";
import { AimController } from "@/lib/aim/aim.controller";
import type { AimingMode, AimState } from "@/lib/aim/aim.types";
import {
  getVehicleDamageEffects,
  projectPartHealth,
  type VehicleDamageEffects,
} from "@/lib/combat/combat.parts";
import { createTankBody } from "@/lib/movement/movement.body";
import type { DriveCommand } from "@/lib/movement/movement.types";
import {
  DEFAULT_PLAYER_LOADOUT,
  VEHICLE_PLATFORMS,
  createPlayerBodyConfig,
} from "@/lib/vehicles/vehicle.config";
import type {
  VehicleLoadout,
  VehicleModelId,
  VehiclePlatform,
} from "@/lib/vehicles/vehicle.types";
import { WEAPONS } from "@/lib/weapons/weapon.config";
import { WeaponCelebrationSystem } from "@/lib/weapons/weapon.celebration";
import type { WeaponConfig } from "@/lib/weapons/weapon.types";
import { SQUAD_CONFIG } from "@/lib/squad/squad.config";
import type { FireDesignationGroup } from "@/lib/squad/squad.types";
import type { VehicleMotion } from "@/lib/vehicles/vehicle.motion";
import {
  createRecoilState,
  type RecoilRef,
} from "@/feature/vehciles/hooks/use-wreck-visual";
import { useArena } from "./arena-context";
import { useCombat } from "./combat-context";
import { useTargets } from "./targets-context";

type PlayerContextValue = {
  playerLoadout: VehicleLoadout;
  playerWeapon: WeaponConfig;
  playerVehicle: VehiclePlatform;
  playerModel: VehicleModelId;
  playerBody: ReturnType<typeof createTankBody>;
  playerCommand: RefObject<DriveCommand>;
  playerMotion: RefObject<VehicleMotion>;
  playerPartHealth: ReturnType<typeof projectPartHealth>;
  playerDamageEffects: VehicleDamageEffects;
  aimRef: RefObject<AimState>;
  aimTargetRef: RefObject<Vector3 | null>;
  playerAimController: RefObject<AimController>;
  celebrationRef: RefObject<WeaponCelebrationSystem>;
  recoilRef: RecoilRef;
  muzzleRef: RefObject<Object3D | null>;
  aimAlignedRef: RefObject<boolean>;
  firingRef: RefObject<boolean>;
  aimMode: AimingMode;
  setAimMode: (mode: AimingMode) => void;
  getCurrentTargetId: () => string | null;
  playerAmmo: RefObject<number>;
  spendAmmo: (cost: number) => boolean;
  refillAmmo: (amount: number) => number;
  designateFireFromAim: (group: FireDesignationGroup) => void;
  paused: boolean;
  destroyed: boolean;
};

const PlayerCtx = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({
  children,
  paused,
  loadout = DEFAULT_PLAYER_LOADOUT,
}: {
  children: ReactNode;
  paused: boolean;
  loadout?: VehicleLoadout;
}) {
  const { health, partHealth, setCurrentAmmo, designateFire } = useCombat();
  const { enemies } = useTargets();
  const arena = useArena();
  const playerWeapon = WEAPONS[loadout.weapon];
  const playerVehicle = VEHICLE_PLATFORMS[loadout.platform];
  const bodyConfig = useMemo(
    () => createPlayerBodyConfig(playerVehicle),
    [playerVehicle],
  );
  const playerBody = useMemo(
    () =>
      createTankBody(
        new Vector3(arena.playerSpawn[0], 0, arena.playerSpawn[1]),
        arena.playerHeading,
        {
          terrain: arena.terrain,
          bound: arena.bound,
          obstacles: arena.obstacles,
        },
        bodyConfig,
      ),
    [arena, bodyConfig],
  );
  const playerCommand = useRef<DriveCommand>({
    throttle: 0,
    desiredHeading: null,
    steer: 0,
  });
  const playerMotion = useRef<VehicleMotion>({ speed: 0, steer: 0 });
  const aimRef = useRef<AimState>({ ...AIM_START });
  const aimTargetRef = useRef<Vector3 | null>(null);
  const playerAimController = useRef<AimController>(new AimController("auto"));
  const celebrationRef = useRef<WeaponCelebrationSystem>(
    new WeaponCelebrationSystem(),
  );
  const recoilRef = useRef(createRecoilState());
  const muzzleRef = useRef<Object3D | null>(null);
  const aimAlignedRef = useRef(false);
  const firingRef = useRef(false);
  const [aimMode, setAimModeState] = useState<AimingMode>("auto");
  const playerAmmo = useRef<number>(COMBAT_CONFIG.MAX_AMMO);

  const setAimMode = useCallback((mode: AimingMode) => {
    playerAimController.current.setMode(mode);
    setAimModeState(mode);
  }, []);

  const getCurrentTargetId = useCallback(
    () => playerAimController.current.getTargetId(),
    [],
  );

  const designateFireFromAim = useCallback(
    (group: FireDesignationGroup) => {
      if (
        paused ||
        (health[COMBAT_CONFIG.PLAYER_ID] ?? COMBAT_CONFIG.PLAYER_MAX_HEALTH) <=
          0
      ) {
        return;
      }
      const aim = aimTargetRef.current;
      const origin = playerBody.position;
      const point = aim
        ? { x: aim.x, z: aim.z }
        : {
            x:
              origin.x +
              Math.sin(playerBody.heading) * DEFAULT_FALLBACK_AIM_DISTANCE,
            z:
              origin.z +
              Math.cos(playerBody.heading) * DEFAULT_FALLBACK_AIM_DISTANCE,
          };
      let targetId: string | undefined;
      let closest = SQUAD_CONFIG.designateVehicleSnapRadius ** 2;
      for (const enemy of enemies) {
        const dx = enemy.position[0] - point.x;
        const dz = enemy.position[2] - point.z;
        const distanceSq = dx * dx + dz * dz;
        if (distanceSq < closest) {
          closest = distanceSq;
          targetId = enemy.id;
        }
      }
      designateFire(group, point, targetId);
    },
    [aimTargetRef, designateFire, enemies, health, paused, playerBody],
  );

  useEffect(() => {
    playerCommand.current.throttle = 0;
    playerCommand.current.steer = 0;
    playerCommand.current.desiredHeading = null;
    playerMotion.current.speed = 0;
    playerMotion.current.steer = 0;
    aimRef.current = { ...AIM_START };
    aimTargetRef.current = null;
    playerAimController.current.setMode("auto");
    celebrationRef.current.reset();
    recoilRef.current = createRecoilState();
    aimAlignedRef.current = false;
    firingRef.current = false;
    setAimModeState("auto");
    playerAmmo.current = COMBAT_CONFIG.MAX_AMMO;
    setCurrentAmmo(COMBAT_CONFIG.MAX_AMMO);
  }, [arena, loadout.weapon, setCurrentAmmo]);

  const spendAmmo = useCallback(
    (cost: number) => {
      if (playerAmmo.current < cost) return false;
      playerAmmo.current -= cost;
      setCurrentAmmo(playerAmmo.current);
      return true;
    },
    [setCurrentAmmo],
  );

  const refillAmmo = useCallback(
    (amount: number) => {
      if (amount <= 0) return 0;
      const next = Math.min(
        COMBAT_CONFIG.MAX_AMMO,
        playerAmmo.current + amount,
      );
      const gained = next - playerAmmo.current;
      if (gained <= 0) return 0;

      playerAmmo.current = next;
      setCurrentAmmo(next);
      return gained;
    },
    [setCurrentAmmo],
  );

  const playerPartHealth = useMemo(
    () =>
      projectPartHealth(
        partHealth,
        COMBAT_CONFIG.PLAYER_ID,
        COMBAT_CONFIG.PLAYER_MAX_HEALTH,
      ),
    [partHealth],
  );

  const playerDamageEffects = useMemo(
    () =>
      getVehicleDamageEffects(
        playerPartHealth,
        COMBAT_CONFIG.PLAYER_MAX_HEALTH,
      ),
    [playerPartHealth],
  );

  useEffect(() => {
    playerBody.setDamageModifiers({
      maxSpeedFactor: playerDamageEffects.maxSpeedFactor,
      accelerationFactor: playerDamageEffects.accelerationFactor,
      turnRateFactor: playerDamageEffects.turnRateFactor,
      tractionFactor: playerDamageEffects.tractionFactor,
    });
  }, [playerBody, playerDamageEffects]);

  const destroyed =
    (health[COMBAT_CONFIG.PLAYER_ID] ?? COMBAT_CONFIG.PLAYER_MAX_HEALTH) <= 0;

  const value = useMemo<PlayerContextValue>(
    () => ({
      playerLoadout: loadout,
      playerWeapon,
      playerVehicle,
      playerModel: loadout.model,
      playerBody,
      playerCommand,
      playerMotion,
      playerPartHealth,
      playerDamageEffects,
      aimRef,
      aimTargetRef,
      playerAimController,
      celebrationRef,
      recoilRef,
      muzzleRef,
      aimAlignedRef,
      firingRef,
      aimMode,
      setAimMode,
      getCurrentTargetId,
      playerAmmo,
      spendAmmo,
      refillAmmo,
      designateFireFromAim,
      paused,
      destroyed,
    }),
    [
      loadout,
      playerWeapon,
      playerVehicle,
      loadout.model,
      playerBody,
      playerPartHealth,
      playerDamageEffects,
      aimRef,
      aimTargetRef,
      playerAimController,
      celebrationRef,
      recoilRef,
      muzzleRef,
      aimAlignedRef,
      firingRef,
      aimMode,
      setAimMode,
      getCurrentTargetId,
      playerAmmo,
      spendAmmo,
      refillAmmo,
      designateFireFromAim,
      paused,
      destroyed,
    ],
  );

  return <PlayerCtx.Provider value={value}>{children}</PlayerCtx.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerCtx);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
