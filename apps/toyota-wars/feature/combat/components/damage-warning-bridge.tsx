"use client";

import { useEffect } from "react";
import { useGameFrame } from "@/render-loop";
import { useFx } from "@/context/fx-context";
import { usePlayer } from "@/context/player-context";
import { playerHeadingRef, report } from "@toyota/combat";

const MAX_RANGE = 150; // metres
const MIN_RANGE = 2; // ignore point-blank self-shots
const AIM_THRESHOLD = 0.85; // ~31° cone

/**
 * Feeds "incoming fire" events into the damage-warning store.
 * Must live inside <Canvas> (uses the frame loop + player context).
 */
export function DamageWarningBridge() {
  const fx = useFx();
  const { playerBody } = usePlayer();

  // Track heading every frame so the HUD can rotate the ring smoothly.
  // KinematicTankBody.heading has forward = (sin h, cos h); playerHeadingRef
  // wants worldAngle = atan2(fwd.x, -fwd.z) = atan2(sin h, -cos h).
  useGameFrame(() => {
    const h = playerBody.heading;
    playerHeadingRef.current = Math.atan2(Math.sin(h), -Math.cos(h));
  }, "postSimSync");

  useEffect(() => {
    // fx.subscribe is assumed to exist (FxAudio uses it too). Adapt the name
    // if your fx store uses `.on` / `.addEventListener`.
    const offShot = fx.on("shot", ({ source, origin, direction }) => {
      if (source === "player") return;

      const dx = playerBody.position.x - origin.x;
      const dz = playerBody.position.z - origin.z;
      const distSq = dx * dx + dz * dz;
      if (distSq < MIN_RANGE * MIN_RANGE) return;
      if (distSq > MAX_RANGE * MAX_RANGE) return;

      const dist = Math.sqrt(distSq);
      const ux = dx / dist;
      const uz = dz / dist;

      // Only consider the horizontal component — tanks live on a plane.
      const dh = Math.hypot(direction.x, direction.z);
      if (dh < 0.01) return;
      const dxN = direction.x / dh;
      const dzN = direction.z / dh;

      // Does this shot point at us?
      const dot = ux * dxN + uz * dzN;
      if (dot < AIM_THRESHOLD) return;

      // Convert source → player direction to "source angle from player".
      const worldAngle = Math.atan2(-dx, dz); // = atan2(origin.x - p.x, -(origin.z - p.z))
      const proximity = 1 - dist / MAX_RANGE;
      const aim = (dot - AIM_THRESHOLD) / (1 - AIM_THRESHOLD);
      const intensity = Math.max(
        0.25,
        Math.min(1, 0.35 + proximity * 0.4 + aim * 0.25),
      );

      report(worldAngle, intensity, 900);
    });

    return () => {
      offShot?.();
    };
  }, [fx, playerBody]);

  return null;
}
