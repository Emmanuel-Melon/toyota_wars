"use client";

import { useRef } from "react";
import { useGameFrame } from "@/render-loop";
import { ProceduralAudio } from "@/lib/audio/audio.procedural";
import type { Unit } from "@/lib/squad/squad.registry";
import {
  COMBAT_CONFIG,
  VEHICLE_COLLISION_CONFIG,
} from "@/lib/combat/combat.config";
import { useBattle } from "@/context/battle-context";
import { useCombat } from "@/context/combat-context";
import { usePlayer } from "@/context/player-context";

type CapsuleOverlap = {
  /** Unit vector pointing from A toward B. */
  nx: number;
  nz: number;
  depth: number;
};

/** Two-circle capsule test: deepest overlap across the four circle pairs. */
function capsuleOverlap(a: Unit, b: Unit): CapsuleOverlap | null {
  const half = VEHICLE_COLLISION_CONFIG.CAPSULE_HALF_LENGTH;
  const aFx = Math.sin(a.body.heading) * half;
  const aFz = Math.cos(a.body.heading) * half;
  const bFx = Math.sin(b.body.heading) * half;
  const bFz = Math.cos(b.body.heading) * half;

  const minDistance = a.radius + b.radius;
  let bestDepth = 0;
  let bestNx = 0;
  let bestNz = 0;

  for (let ai = -1; ai <= 1; ai += 2) {
    const ax = a.position.x + aFx * ai;
    const az = a.position.z + aFz * ai;

    for (let bi = -1; bi <= 1; bi += 2) {
      const dx = b.position.x + bFx * bi - ax;
      const dz = b.position.z + bFz * bi - az;
      const distance = Math.hypot(dx, dz);
      if (distance >= minDistance) continue;

      const depth = minDistance - distance;
      if (depth <= bestDepth) continue;

      bestDepth = depth;
      if (distance > 1e-6) {
        bestNx = dx / distance;
        bestNz = dz / distance;
      } else {
        bestNx = 1;
        bestNz = 0;
      }
    }
  }

  return bestDepth > 0 ? { nx: bestNx, nz: bestNz, depth: bestDepth } : null;
}

function pairKey(a: Unit, b: Unit): string {
  return a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
}

function horizontalVelocity(unit: Unit, out: { x: number; z: number }) {
  out.x = Math.sin(unit.body.heading) * unit.body.speed;
  out.z = Math.cos(unit.body.heading) * unit.body.speed;
}

export function VehicleCollisionSystem() {
  const { registry } = useBattle();
  const { health, onHit, onKill, winner } = useCombat();
  const { paused } = usePlayer();

  const contactUntil = useRef(new Map<string, number>());
  const velocityA = useRef({ x: 0, z: 0 });
  const velocityB = useRef({ x: 0, z: 0 });

  useGameFrame((state) => {
    if (!VEHICLE_COLLISION_CONFIG.ENABLED) return;

    const units = registry.all();
    const damageByUnit = new Map<string, number>();
    const damageAllowed = !paused && !winner;
    const now = state.clock.elapsedTime;

    for (let i = 0; i < units.length; i += 1) {
      const a = units[i];
      if ((health[a.id] ?? COMBAT_CONFIG.MAX_HEALTH) <= 0) continue;

      for (let j = i + 1; j < units.length; j += 1) {
        const b = units[j];
        if ((health[b.id] ?? COMBAT_CONFIG.MAX_HEALTH) <= 0) continue;

        const overlap = capsuleOverlap(a, b);
        if (!overlap) continue;

        const key = pairKey(a, b);
        const inContact = (contactUntil.current.get(key) ?? -Infinity) > now;

        const canDamage =
          damageAllowed &&
          (VEHICLE_COLLISION_CONFIG.FRIENDLY_FIRE || a.team !== b.team);

        let closing = 0;

        if (!inContact && damageAllowed) {
          horizontalVelocity(a, velocityA.current);
          horizontalVelocity(b, velocityB.current);

          const approachA =
            velocityA.current.x * overlap.nx + velocityA.current.z * overlap.nz;
          const approachB = -(
            velocityB.current.x * overlap.nx +
            velocityB.current.z * overlap.nz
          );
          closing = approachA + approachB;

          ProceduralAudio.playVehicleCollision(closing);

          if (canDamage && closing > VEHICLE_COLLISION_CONFIG.SPEED_THRESHOLD) {
            const rammer = approachA >= approachB ? a : b;
            const rammed = rammer === a ? b : a;
            const damage = Math.min(
              VEHICLE_COLLISION_CONFIG.MAX_DAMAGE,
              (closing - VEHICLE_COLLISION_CONFIG.SPEED_THRESHOLD) *
                VEHICLE_COLLISION_CONFIG.DAMAGE_SCALE,
            );

            if (damage > 0) {
              const applied = damageByUnit.get(rammed.id) ?? 0;
              const remaining =
                (health[rammed.id] ?? COMBAT_CONFIG.MAX_HEALTH) - applied;

              if (remaining > 0) {
                if (remaining - damage <= 0) {
                  onKill(rammer.team, rammed.id);
                }
                onHit(rammed.id, "body", damage);
                damageByUnit.set(rammed.id, applied + damage);
              }
            }
          }
        }

        // Keep the pair "in contact" while they overlap, so a sustained shove
        // only deals damage once instead of every frame.
        contactUntil.current.set(
          key,
          now + VEHICLE_COLLISION_CONFIG.CONTACT_GRACE,
        );

        const push =
          overlap.depth / 2 + VEHICLE_COLLISION_CONFIG.SEPARATION_SLOP;
        a.nudge?.(-overlap.nx * push, -overlap.nz * push);
        b.nudge?.(overlap.nx * push, overlap.nz * push);
      }
    }
  }, "collision");

  return null;
}
