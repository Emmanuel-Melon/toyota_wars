// apps/toyota-wars/feature/vehciles/hooks/use-vehicle-effects.ts
import { useDust } from "@/feature/effects/components/dust-system";
import { AXLE_Y, WHEEL } from "@/feature/vehciles/vehicles.config";
import type { VehicleMotion } from "@/feature/vehciles/vehicles.utils";
import {
  DESTRUCTION_DURATION,
  type RecoilRef,
} from "@/feature/vehciles/hooks/use-wreck-visual";
import type { VehiclePartHealth } from "@/context/vehicle-context";
import { isPartDestroyed } from "@/lib/combat/combat.parts";
import type { VehiclePart } from "@/lib/combat/combat.teams";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

type Spring = { x: number; v: number };
const spring = (): Spring => ({ x: 0, v: 0 });
const step = (s: Spring, k: number, c: number, dt: number) => {
  s.v += (-k * s.x - c * s.v) * dt;
  s.x += s.v * dt;
};

const _p = new THREE.Vector3();
const _d = new THREE.Vector3();
const _w = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

export function useVehicleEffects({
  bodyRef,
  vehicleRef,
  muzzleRef,
  recoilRef,
  motionRef,
  maxHealth,
  partHealth,
  destructionActive = false,
  destructionSeed = 0.5,
}: {
  bodyRef: RefObject<THREE.Group | null>;
  vehicleRef?: RefObject<THREE.Group | null>;
  muzzleRef?: RefObject<THREE.Object3D | null>;
  recoilRef?: RecoilRef;
  motionRef?: RefObject<VehicleMotion>;
  maxHealth: number;
  partHealth?: VehiclePartHealth;
  destructionActive?: boolean;
  destructionSeed?: number;
}) {
  const dust = useDust();
  const pitch = useRef(spring());
  const back = useRef(spring());
  const roll = useRef(spring());
  const shake = useRef(0);
  const trail = useRef(0);
  const destruction = useRef(0);
  const wreckPose = useMemo(() => {
    const flip = destructionSeed < 0.5 ? -1 : 1;
    const phase = destructionSeed * Math.PI * 2;
    return {
      pitch: 0.26 + destructionSeed * 0.46,
      roll: flip * (0.4 + ((destructionSeed * 7) % 1) * 0.52),
      yaw: flip * (0.1 + destructionSeed * 0.22),
      sink: 0.3 + ((destructionSeed * 13) % 1) * 0.2,
      driftX: Math.sin(phase) * 0.45,
      driftZ: Math.cos(phase * 2) * 0.5,
      phase,
    };
  }, [destructionSeed]);

  useEffect(() => {
    if (!destructionActive) destruction.current = 0;
  }, [destructionActive]);

  const wheelPart = (z: number, side: number): VehiclePart =>
    `${z === (WHEEL.axles.find((a) => a.steers) ?? WHEEL.axles[0]).z ? "wheelF" : "wheelR"}${side > 0 ? "L" : "R"}` as VehiclePart;

  const wheelActive = (z: number, side: number) => {
    const part = wheelPart(z, side);
    return !isPartDestroyed(partHealth?.[part], part, maxHealth);
  };

  const wheelContact = (
    vehicle: THREE.Group,
    side: number,
    z: number,
    out: THREE.Vector3,
  ) =>
    vehicle.localToWorld(
      out.set(side * WHEEL.trackHalfWidth, AXLE_Y - WHEEL.radius, z),
    );

  useFrame((_, rawDelta) => {
    const body = bodyRef.current;
    const vehicle = vehicleRef?.current;
    if (!body || !vehicle) return;
    const dt = Math.min(rawDelta, 1 / 30);
    const r = recoilRef?.current;

    if (r && r.pending > 0) {
      const s = Math.min(r.pending, 5);
      r.pending = 0;

      pitch.current.v += 0.42 * s;
      back.current.v += 1.15 * s;
      roll.current.v += 0.32 * s * (Math.random() * 2 - 1);
      shake.current = Math.min(1.6, shake.current + 0.45 * s);
      r.barrel = Math.min(1, 0.4 + 0.3 * s);

      const muzzle = muzzleRef?.current;
      if (muzzle) {
        muzzle.getWorldPosition(_p);
        muzzle.getWorldDirection(_d);
        const groundY = wheelContact(vehicle, 0, 0, _w).y;
        dust.emit({
          origin: _w.set(_p.x + _d.x * 2, groundY + 0.05, _p.z + _d.z * 2),
          dir: _d,
          count: Math.round(8 * s),
          speed: 3.5,
          spread: 1.4,
          lift: 1.0,
          size: 1.3,
          life: 1.0,
        });
      }
      for (const { z } of WHEEL.axles) {
        for (const side of [-1, 1]) {
          if (!wheelActive(z, side)) continue;
          dust.emit({
            origin: wheelContact(vehicle, side, z, _p),
            dir: _up,
            count: 2,
            speed: 0.4,
            spread: 1.0,
            lift: 0.6,
            size: 0.7,
            life: 0.7,
          });
        }
      }
    }

    step(pitch.current, 180, 11, dt);
    step(back.current, 260, 16, dt);
    step(roll.current, 220, 12, dt);
    shake.current *= Math.exp(-12 * dt);
    if (r) r.barrel *= Math.exp(-14 * dt);

    if (destructionActive) {
      destruction.current = Math.min(
        DESTRUCTION_DURATION,
        destruction.current + dt,
      );
      const t = destruction.current / DESTRUCTION_DURATION;
      const settle = 1 - Math.pow(1 - t, 3);
      const wobble = 1 - t;
      const j = shake.current * 0.02;
      body.rotation.set(
        -pitch.current.x +
          Math.sin(t * Math.PI * 3.2 + wreckPose.phase) * 0.18 * wobble +
          settle * wreckPose.pitch +
          (Math.random() - 0.5) * j,
        Math.sin(t * Math.PI * 1.6 + wreckPose.phase) * wreckPose.yaw * settle +
          Math.sin(t * Math.PI * 2.4) * 0.12 * wobble +
          (Math.random() - 0.5) * j,
        roll.current.x +
          Math.cos(t * Math.PI * 2.8 + wreckPose.phase) * 0.22 * wobble +
          settle * wreckPose.roll +
          (Math.random() - 0.5) * j,
      );
      body.position.set(
        wreckPose.driftX * settle + (Math.random() - 0.5) * j * 0.5,
        -settle * wreckPose.sink +
          Math.sin(t * Math.PI * 5 + wreckPose.phase) * 0.05 * wobble,
        -back.current.x + wreckPose.driftZ * settle,
      );
      return;
    }

    const j = shake.current * 0.018;
    body.rotation.set(
      -pitch.current.x + (Math.random() - 0.5) * j,
      (Math.random() - 0.5) * j * 0.6,
      roll.current.x + (Math.random() - 0.5) * j,
    );
    body.position.set(0, (Math.random() - 0.5) * j * 0.4, -back.current.x);

    const speed = motionRef?.current.speed ?? 0;
    if (Math.abs(speed) > 2) {
      trail.current += Math.abs(speed) * dt * 0.8;
      while (trail.current >= 1) {
        trail.current -= 1;
        _d.set(0, 0, 1).transformDirection(vehicle.matrixWorld);
        _d.multiplyScalar(-Math.sign(speed));
        for (const side of [-1, 1]) {
          const rear = WHEEL.axles.find((a) => !a.steers) ?? WHEEL.axles[0];
          if (!wheelActive(rear.z, side)) continue;
          dust.emit({
            origin: wheelContact(vehicle, side, rear.z, _p),
            dir: _d,
            count: 1,
            speed: Math.min(Math.abs(speed) * 0.25, 3),
            spread: 0.6,
            lift: 0.8,
            size: 0.9,
            life: 1.1,
          });
        }
      }
    }
  });
}
