// feature/terrain/hooks/use-wheel-emitters.ts
import { useCallback } from "react";
import { Environment, Vehicle } from "@toyota/models";

type PlayerBodyLike = {
  position: { x: number; y: number; z: number };
  heading: number;
  speed: number;
};

const { trackHalfWidth, axles } = Vehicle.WHEEL_VISUAL;

const WHEELS = [
  { id: "fl", x: -trackHalfWidth, z: axles[0].z },
  { id: "fr", x: +trackHalfWidth, z: axles[0].z },
  { id: "rl", x: -trackHalfWidth, z: axles[1].z },
  { id: "rr", x: +trackHalfWidth, z: axles[1].z },
] as const;

export const WHEEL_IDS = WHEELS.map((w) => w.id);

export function useWheelEmitters(
  playerBody: PlayerBodyLike,
  isOffRoad: () => boolean,
) {
  return useCallback((): Environment.WheelEmitter[] => {
    const speed = playerBody.speed;
    const strength = Math.abs(speed) < 1.5 ? 0 : isOffRoad() ? 1 : 0.12;
    if (strength === 0) return [];

    // forward = (sin h, cos h); reverse flips the dust direction
    const dir = Math.sign(speed) || 1;
    const sin = Math.sin(playerBody.heading);
    const cos = Math.cos(playerBody.heading);
    const dirX = sin * dir;
    const dirZ = cos * dir;

    return WHEELS.map((w) => ({
      x: playerBody.position.x + w.x * cos + w.z * sin,
      z: playerBody.position.z - w.x * sin + w.z * cos,
      speed: Math.abs(speed),
      dirX,
      dirZ,
      strength,
    }));
  }, [playerBody, isOffRoad]);
}
