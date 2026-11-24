import type * as THREE from "three";
import type { TerrainSampler } from "@/lib/map/map.terrain";
import {
  PLAYER_CAMERA_CONFIG,
  PLAYER_CAMERA_DAMAGE,
  DRONE_CAMERA_CONFIG,
  DRONE_ROAM_CONFIG,
  PORTRAIT_CAMERA_FRAMING,
  MOBILE_CAMERA_LOOK_CONFIG,
} from "./camera.config";
import type { CameraPoseInput, DroneRoamState } from "./camera.types";

export type { CameraPoseInput } from "./camera.types";

/** Shared orbit math for any "camera behind a heading" pose. */
function computeOrbitPosition(
  pose: CameraPoseInput,
  terrain: TerrainSampler,
  offset: readonly [number, number, number],
  clearance: number,
  out: THREE.Vector3,
  heading = pose.heading,
  pitchOffset?: number,
): THREE.Vector3 {
  const { x, y, z } = pose;
  let [ox, oy, oz] = offset;

  if (pitchOffset !== undefined) {
    const horizontalRadius = Math.hypot(ox, oz);
    if (horizontalRadius > 0) {
      const radius = Math.hypot(horizontalRadius, oy);
      const baseElevation = Math.atan2(oy, horizontalRadius);
      const elevation = Math.min(
        MOBILE_CAMERA_LOOK_CONFIG.maxPitch,
        Math.max(
          MOBILE_CAMERA_LOOK_CONFIG.minPitch,
          baseElevation + pitchOffset,
        ),
      );
      const horizontalAngle = Math.atan2(ox, oz);
      const effectiveRadius = radius * Math.cos(elevation);
      ox = Math.sin(horizontalAngle) * effectiveRadius;
      oz = Math.cos(horizontalAngle) * effectiveRadius;
      oy = radius * Math.sin(elevation);
    }
  }

  const sin = Math.sin(heading);
  const cos = Math.cos(heading);
  out.set(x + ox * cos + oz * sin, y + oy, z - ox * sin + oz * cos);
  out.y = Math.max(out.y, terrain.getHeight(out.x, out.z) + clearance);
  return out;
}

function computeLookTarget(
  pose: CameraPoseInput,
  lookAhead: number,
  lookHeight: number,
  out: THREE.Vector3,
  heading = pose.heading,
): THREE.Vector3 {
  const { x, y, z } = pose;
  const sin = Math.sin(heading);
  const cos = Math.cos(heading);
  out.set(x + sin * lookAhead, y + lookHeight, z + cos * lookAhead);
  return out;
}

// ── Chase mode (existing behavior, unchanged) ──────────────────────────

export function computeCameraPosition(
  pose: CameraPoseInput,
  terrain: TerrainSampler,
  out: THREE.Vector3,
): THREE.Vector3 {
  const [ox, oy, oz] = PLAYER_CAMERA_CONFIG.offset;
  const portrait = pose.portrait === true;
  const effectiveOz =
    oz *
    (1 - pose.visionPenalty * PLAYER_CAMERA_DAMAGE.offsetPenalty) *
    (portrait ? PORTRAIT_CAMERA_FRAMING.chaseDistance : 1);
  const effectiveOy = oy * (portrait ? PORTRAIT_CAMERA_FRAMING.chaseHeight : 1);
  return computeOrbitPosition(
    pose,
    terrain,
    [ox, effectiveOy, effectiveOz],
    PLAYER_CAMERA_CONFIG.terrainClearance,
    out,
    pose.heading + (pose.yawOffset ?? 0),
    pose.pitchOffset,
  );
}

export function computeCameraTarget(
  pose: CameraPoseInput,
  out: THREE.Vector3,
): THREE.Vector3 {
  const lookAhead =
    PLAYER_CAMERA_CONFIG.lookAhead *
    (pose.portrait ? PORTRAIT_CAMERA_FRAMING.chaseLookAhead : 1);
  return computeLookTarget(
    pose,
    lookAhead,
    PLAYER_CAMERA_CONFIG.lookHeight,
    out,
    pose.heading + (pose.yawOffset ?? 0),
  );
}

export function computeCameraFov(
  visionPenalty: number,
  portrait = false,
): number {
  const baseFov =
    PLAYER_CAMERA_CONFIG.fov *
    (portrait ? PORTRAIT_CAMERA_FRAMING.chaseFov : 1);
  return baseFov * (1 - visionPenalty * PLAYER_CAMERA_DAMAGE.fovPenalty);
}

// ── Drone mode ─────────────────────────────────────────────────────────

export function computeDronePosition(
  pose: CameraPoseInput,
  terrain: TerrainSampler,
  out: THREE.Vector3,
): THREE.Vector3 {
  const portrait = pose.portrait === true;
  const [ox, oy, oz] = DRONE_CAMERA_CONFIG.offset;
  return computeOrbitPosition(
    pose,
    terrain,
    [
      ox,
      oy * (portrait ? PORTRAIT_CAMERA_FRAMING.droneHeight : 1),
      oz * (portrait ? PORTRAIT_CAMERA_FRAMING.droneDistance : 1),
    ],
    DRONE_CAMERA_CONFIG.terrainClearance,
    out,
  );
}

export function computeDroneTarget(
  pose: CameraPoseInput,
  out: THREE.Vector3,
): THREE.Vector3 {
  const lookAhead =
    DRONE_CAMERA_CONFIG.lookAhead *
    (pose.portrait ? PORTRAIT_CAMERA_FRAMING.droneLookAhead : 1);
  return computeLookTarget(
    pose,
    lookAhead,
    DRONE_CAMERA_CONFIG.lookHeight,
    out,
  );
}

export function computeDroneFov(portrait = false): number {
  return (
    DRONE_CAMERA_CONFIG.fov * (portrait ? PORTRAIT_CAMERA_FRAMING.droneFov : 1)
  );
}

export function computeDroneRoamPosition(
  roam: DroneRoamState,
  terrain: TerrainSampler,
  out: THREE.Vector3,
): THREE.Vector3 {
  const altitude = Math.max(
    roam.altitude,
    DRONE_CAMERA_CONFIG.terrainClearance,
  );
  out.set(roam.x, terrain.getHeight(roam.x, roam.z) + altitude, roam.z);
  return out;
}

export function computeDroneRoamTarget(
  roam: DroneRoamState,
  terrain: TerrainSampler,
  out: THREE.Vector3,
): THREE.Vector3 {
  const x = roam.x + Math.sin(roam.heading) * DRONE_ROAM_CONFIG.lookAhead;
  const z = roam.z + Math.cos(roam.heading) * DRONE_ROAM_CONFIG.lookAhead;
  out.set(x, terrain.getHeight(x, z) + DRONE_ROAM_CONFIG.lookHeight, z);
  return out;
}

export function computeDroneRoamFov(): number {
  return DRONE_ROAM_CONFIG.fov;
}
