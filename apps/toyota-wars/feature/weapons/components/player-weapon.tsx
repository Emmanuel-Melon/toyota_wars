// apps/toyota-wars/feature/weapons/components/player-weapon.tsx
"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useGameFrame } from "@/render-loop";
import * as THREE from "three";
import {
  AutoAimingStrategy,
  aimHeading,
  calculatePredictedIntercept,
  createFireRequest,
  DefaultWeaponExecutor,
  readMuzzleTransform,
  Weapon,
  WeaponBloomSystem,
} from "@toyota/combat";
import { AGENT_CONFIG } from "@/lib/agents/agent-runtime.config";
import { useArena } from "@/context/arena-context";
import { useCombat } from "@/context/combat-context";
import { useMissionFlow } from "@/feature/mission-flow/mission-flow.context";
import { usePlayer } from "@/context/player-context";
import { useTargets } from "@/context/targets-context";
import { useBattle, useProjectileSystem } from "@/context/battle-context";
import { kickRecoil } from "@/feature/vehciles/hooks/use-wreck-visual";
import { FIRE_KEY_CODE } from "@/feature/controls/keyboard-bindings";
import { useTutorialGates } from "@/feature/game/tutorial/tutorial-gates";

export function PlayerWeapon() {
  const {
    playerWeapon,
    playerBody: body,
    aimRef,
    aimTargetRef,
    playerAimController,
    celebrationRef,
    recoilRef,
    muzzleRef,
    aimMode,
    setAimMode,
    firingRef,
    playerAmmo,
    spendAmmo,
    playerControlsLocked,
    destroyed,
    playerDamageEffects,
  } = usePlayer();
  const { phase } = useMissionFlow();
  const { fireDesignation, stats } = useCombat();
  const { enemies } = useTargets();
  const arena = useArena();
  const { camera } = useThree();
  const projectiles = useProjectileSystem();
  const { registry } = useBattle();
  const { capabilities, reportShot } = useTutorialGates();
  const controlsLockedRef = useRef(playerControlsLocked);
  const destroyedRef = useRef(destroyed);
  const weaponDisabledRef = useRef(playerDamageEffects.weaponDisabled);
  const weapon = useRef(new Weapon(playerWeapon.cooldown));
  const bloom = useRef(new WeaponBloomSystem());
  const executor = useRef(
    new DefaultWeaponExecutor(
      weapon.current,
      {
        range: playerWeapon.engagementRange,
        alignmentToleranceRad: AGENT_CONFIG.defaultMaxAngleOffsetRad,
      },
      new AutoAimingStrategy(),
    ),
  );
  const targetPoint = useRef(new THREE.Vector3());
  const aimPoint = useRef(new THREE.Vector3());
  const targetVelocity = useRef(new THREE.Vector3());
  const designatedPoint = useRef(new THREE.Vector3());
  const shotOrigin = useRef(new THREE.Vector3());
  const muzzlePosition = useRef(new THREE.Vector3());
  const muzzleDirection = useRef(new THREE.Vector3());
  const lastKillCount = useRef(stats.enemiesDestroyed);
  const nextBarrelRef = useRef(0);

  useEffect(() => {
    controlsLockedRef.current = playerControlsLocked;
    if (playerControlsLocked) firingRef.current = false;
  }, [playerControlsLocked]);

  useEffect(() => {
    destroyedRef.current = destroyed;
    if (destroyed) firingRef.current = false;
  }, [destroyed]);

  useEffect(() => {
    weaponDisabledRef.current = playerDamageEffects.weaponDisabled;
    if (playerDamageEffects.weaponDisabled) firingRef.current = false;
  }, [playerDamageEffects.weaponDisabled]);

  useEffect(() => {
    weapon.current = new Weapon(playerWeapon.cooldown);
    bloom.current = new WeaponBloomSystem();
    executor.current = new DefaultWeaponExecutor(
      weapon.current,
      {
        range: playerWeapon.engagementRange,
        alignmentToleranceRad: AGENT_CONFIG.defaultMaxAngleOffsetRad,
      },
      new AutoAimingStrategy(),
    );
    nextBarrelRef.current = 0;
  }, [
    arena,
    playerWeapon.cooldown,
    playerWeapon.engagementRange,
    playerWeapon.id,
  ]);

  useEffect(() => {
    if (stats.enemiesDestroyed < lastKillCount.current) {
      lastKillCount.current = stats.enemiesDestroyed;
      return;
    }
    if (stats.enemiesDestroyed > lastKillCount.current && !destroyed) {
      const maxShots = playerWeapon.mechanism === "rocket" ? 3 : 5;
      celebrationRef.current.triggerCelebration(
        playerWeapon.cooldown,
        maxShots,
      );
    }
    lastKillCount.current = stats.enemiesDestroyed;
  }, [
    celebrationRef,
    destroyed,
    playerWeapon.cooldown,
    playerWeapon.mechanism,
    stats.enemiesDestroyed,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === FIRE_KEY_CODE) {
        event.preventDefault();
        if (
          !capabilities.canFire ||
          controlsLockedRef.current ||
          destroyedRef.current ||
          weaponDisabledRef.current
        ) {
          return;
        }
        firingRef.current = true;
      }
      if (event.code === "KeyM" && phase === "gameplay") {
        setAimMode(aimMode === "auto" ? "manual" : "auto");
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === FIRE_KEY_CODE) firingRef.current = false;
    };
    const handleBlur = () => {
      firingRef.current = false;
    };
    const handleVisibility = () => {
      if (document.hidden) firingRef.current = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [aimMode, capabilities.canFire, phase, setAimMode]);

  useGameFrame((_, delta) => {
    weapon.current.tick(delta);
    const canAct =
      capabilities.canFire &&
      !playerControlsLocked &&
      !playerDamageEffects.weaponDisabled;
    const celebrating = canAct && celebrationRef.current.active;

    if (!canAct) {
      firingRef.current = false;
      return;
    }

    bloom.current.update(delta, firingRef.current && !celebrating);

    const origin = shotOrigin.current.copy(body.position);
    const takeBarrel = () => {
      const count = playerWeapon.muzzles?.length ?? 1;
      const barrel = nextBarrelRef.current % count;
      nextBarrelRef.current = (barrel + 1) % count;
      return barrel;
    };
    const spreadFor = (
      fireOrigin: Readonly<THREE.Vector3>,
      speed: number,
      spreadScale: number,
    ): number => {
      const shotDistance = Math.max(1, fireOrigin.distanceTo(aimPoint.current));
      const precisionSpread = Math.max(
        0.0004,
        (playerWeapon.projectile.hitRadius * 0.75) / shotDistance,
      );
      const rawSpread = bloom.current.getSpreadAngle(
        speed,
        playerWeapon.spread * spreadScale,
      );
      return Math.min(rawSpread, precisionSpread);
    };
    const fireAtTarget = (
      speed: number,
      spreadScale: number,
      barrel: number,
    ): boolean => {
      if (!projectiles.current) return false;
      if (origin.distanceTo(aimPoint.current) > executor.current.getRange()) {
        return false;
      }
      const horizontal = Math.hypot(
        aimPoint.current.x - origin.x,
        aimPoint.current.z - origin.z,
      );
      const pitch =
        horizontal > 1e-6
          ? Math.atan2(aimPoint.current.y - origin.y, horizontal)
          : 0;
      projectiles.current.fire(
        createFireRequest(
          origin,
          aimHeading(origin, aimPoint.current),
          "ally",
          playerWeapon.id,
          spreadFor(origin, speed, spreadScale),
          pitch,
          undefined,
          undefined,
          "player",
          barrel,
        ),
      );
      kickRecoil(recoilRef, playerWeapon.recoil, barrel);
      return true;
    };

    const fireFromMuzzle = (
      speed: number,
      spreadScale: number,
      barrel: number,
    ): boolean => {
      if (
        !projectiles.current ||
        !readMuzzleTransform(
          muzzleRef.current,
          muzzlePosition.current,
          muzzleDirection.current,
        )
      ) {
        return false;
      }
      const origin = muzzlePosition.current;
      const direction = muzzleDirection.current;
      if (origin.distanceTo(aimPoint.current) > executor.current.getRange()) {
        return false;
      }
      const spread = spreadFor(origin, speed, spreadScale);
      projectiles.current.fire(
        createFireRequest(
          origin,
          Math.atan2(direction.x, direction.z),
          "ally",
          playerWeapon.id,
          spread,
          Math.asin(THREE.MathUtils.clamp(direction.y, -1, 1)),
          undefined,
          { position: origin, direction },
          "player",
          barrel,
        ),
      );
      kickRecoil(recoilRef, playerWeapon.recoil, barrel);
      return true;
    };

    if (celebrating) {
      const fired = celebrationRef.current.update(
        delta,
        body.position,
        body.heading,
        weapon.current,
        targetPoint.current,
      );
      aimTargetRef.current = aimPoint.current;
      if (fired && playerAmmo.current >= playerWeapon.ammoCost) {
        bloom.current.registerShot();
        fireAtTarget(0, 0.35, takeBarrel());
        if (spendAmmo(playerWeapon.ammoCost)) reportShot();
      }
      return;
    }

    const aiTargetPosition = fireDesignation
      ? designatedPoint.current.set(
          fireDesignation.point.x,
          arena.terrain.getHeight(
            fireDesignation.point.x,
            fireDesignation.point.z,
          ) + playerWeapon.aimTargetHeight,
          fireDesignation.point.z,
        )
      : null;

    playerAimController.current.updateTarget(
      camera,
      aimRef.current,
      origin,
      body.heading,
      aiTargetPosition,
      playerWeapon.aimTargetHeight,
      targetPoint.current,
      enemies,
      fireDesignation?.targetId ?? null,
      playerWeapon,
      executor.current,
    );

    const targetId =
      playerAimController.current.getTargetId() ??
      fireDesignation?.targetId ??
      null;
    const targetUnit = targetId ? registry.get(targetId) : undefined;
    if (targetUnit) {
      targetVelocity.current.set(
        Math.sin(targetUnit.body.heading) * targetUnit.body.speed,
        0,
        Math.cos(targetUnit.body.heading) * targetUnit.body.speed,
      );
    } else {
      targetVelocity.current.set(0, 0, 0);
    }
    calculatePredictedIntercept(
      origin,
      targetPoint.current,
      targetVelocity.current,
      playerWeapon.projectile.speed,
      aimPoint.current,
      playerWeapon.projectile.gravity,
      3,
    );
    aimTargetRef.current = aimPoint.current;

    if (
      firingRef.current &&
      playerAmmo.current >= playerWeapon.ammoCost &&
      weapon.current.tryFire()
    ) {
      bloom.current.registerShot();
      const barrel = takeBarrel();
      const fired =
        fireFromMuzzle(body.speed, 1, barrel) ||
        fireAtTarget(body.speed, 1, barrel);
      if (fired && spendAmmo(playerWeapon.ammoCost)) {
        reportShot();
      }
    }
  }, "weapons");

  return null;
}
