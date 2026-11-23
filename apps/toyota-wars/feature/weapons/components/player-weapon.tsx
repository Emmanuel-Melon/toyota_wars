// apps/toyota-wars/feature/weapons/components/player-weapon.tsx
"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useGameFrame } from "@/render-loop";
import * as THREE from "three";
import { aimHeading } from "@/lib/aim/aim.math";
import { readMuzzleTransform } from "@/lib/aim/aim.muzzle";
import { calculateBallisticPitch } from "@/lib/combat/combat.ballistics";
import { Weapon } from "@/lib/weapons/weapon.timer";
import { WeaponBloomSystem } from "@/lib/weapons/weapon.bloom";
import { createFireRequest } from "@/lib/weapons/weapon.math";
import { useArena } from "@/context/arena-context";
import { useCombat } from "@/context/combat-context";
import { usePlayer } from "@/context/player-context";
import { useTargets } from "@/context/targets-context";
import { useProjectileSystem } from "@/context/battle-context";
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
    paused,
    destroyed,
    playerDamageEffects,
  } = usePlayer();
  const { fireDesignation, stats } = useCombat();
  const { enemies } = useTargets();
  const arena = useArena();
  const { camera } = useThree();
  const projectiles = useProjectileSystem();
  const { capabilities, reportShot } = useTutorialGates();
  const pausedRef = useRef(paused);
  const destroyedRef = useRef(destroyed);
  const weaponDisabledRef = useRef(playerDamageEffects.weaponDisabled);
  const weapon = useRef(new Weapon(playerWeapon.cooldown));
  const bloom = useRef(new WeaponBloomSystem());
  const targetPoint = useRef(new THREE.Vector3());
  const designatedPoint = useRef(new THREE.Vector3());
  const shotOrigin = useRef(new THREE.Vector3());
  const muzzlePosition = useRef(new THREE.Vector3());
  const muzzleDirection = useRef(new THREE.Vector3());
  const lastKillCount = useRef(stats.enemiesDestroyed);

  useEffect(() => {
    pausedRef.current = paused;
    if (paused) firingRef.current = false;
  }, [paused]);

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
  }, [playerWeapon.cooldown]);

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
          pausedRef.current ||
          destroyedRef.current ||
          weaponDisabledRef.current
        ) {
          return;
        }
        firingRef.current = true;
      }
      if (event.code === "KeyM") {
        setAimMode(aimMode === "auto" ? "manual" : "auto");
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === FIRE_KEY_CODE) firingRef.current = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [aimMode, capabilities.canFire, setAimMode]);

  useGameFrame((_, delta) => {
    weapon.current.tick(delta);
    const canAct =
      capabilities.canFire &&
      !paused &&
      !destroyed &&
      !playerDamageEffects.weaponDisabled;
    const celebrating = canAct && celebrationRef.current.active;

    if (!canAct) {
      firingRef.current = false;
      return;
    }

    bloom.current.update(delta, firingRef.current && !celebrating);

    const origin = shotOrigin.current.copy(body.position);
    const fireAtTarget = (speed: number, spreadScale: number): boolean => {
      if (!projectiles.current) return false;
      const spread = bloom.current.getSpreadAngle(
        speed,
        playerWeapon.spread * spreadScale,
      );
      const pitch = calculateBallisticPitch(
        origin,
        targetPoint.current,
        playerWeapon.projectile.speed,
        playerWeapon.projectile.gravity,
      );
      projectiles.current.fire(
        createFireRequest(
          origin,
          aimHeading(origin, targetPoint.current),
          "ally",
          playerWeapon.id,
          spread,
          pitch,
          undefined,
          undefined,
          "player",
        ),
      );
      kickRecoil(recoilRef, playerWeapon.recoil);
      return true;
    };

    const fireFromMuzzle = (speed: number, spreadScale: number): boolean => {
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
      const spread = bloom.current.getSpreadAngle(
        speed,
        playerWeapon.spread * spreadScale,
      );
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
        ),
      );
      kickRecoil(recoilRef, playerWeapon.recoil);
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
      aimTargetRef.current = targetPoint.current;
      if (fired && playerAmmo.current >= playerWeapon.ammoCost) {
        bloom.current.registerShot();
        fireAtTarget(0, 0.35);
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
      body.position,
      body.heading,
      aiTargetPosition,
      playerWeapon.aimTargetHeight,
      targetPoint.current,
      enemies,
      fireDesignation?.targetId ?? null,
      playerWeapon,
    );
    aimTargetRef.current = targetPoint.current;

    if (
      firingRef.current &&
      playerAmmo.current >= playerWeapon.ammoCost &&
      weapon.current.tryFire()
    ) {
      bloom.current.registerShot();
      const fired =
        fireFromMuzzle(body.speed, 1) || fireAtTarget(body.speed, 1);
      if (fired && spendAmmo(playerWeapon.ammoCost)) {
        reportShot();
      }
    }
  }, "weapons");

  return null;
}
