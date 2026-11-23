// apps/toyota-wars/feature/vehciles/vehicles.config.ts
import { RIDE_HEIGHT } from "@/lib/vehicles/ride-height";
import { VEHICLE_STEERING } from "@/lib/vehicles/vehicle.motion";

export const HULL = {
  width: 2.6,
  height: 1.15,
  length: 4.2,
} as const;

export const WHEEL = {
  radius: 0.55,
  width: 0.45,
  // x offset of wheel center from the hull centerline (slightly overlaps the hull side)
  trackHalfWidth: HULL.width / 2 + 0.45 / 2 - 0.1,
  // z positions of axles; +Z is forward. `steers` only on the front axle.
  axles: [
    { z: 1.5, steers: true },
    { z: -1.5, steers: false },
  ],
  wheelbase: VEHICLE_STEERING.wheelbase, // front axle to rear axle, used for the steer angle
  maxSteer: VEHICLE_STEERING.maxSteer, // radians
} as const;

/** Wheel center y in hull space: wheel radius minus ride height. */
export const AXLE_Y = WHEEL.radius - RIDE_HEIGHT; // -0.225

/** Shared extrusion settings for all body panels. */
export const GEOMETRY = {
  bevel: 0.03,
} as const;

export const PICKUP = {
  width: 1.85,
  baseY: AXLE_Y + 0.2, // underside of the body shell (group origin = this)
  archR: WHEEL.radius + 0.14,
  frontZ: 2.65,
  rearZ: -2.65,
  cabRearZ: -0.9,
  bedFloorY: 0.5, // relative to baseY
  bedSideH: 0.95,
  mountZ: -1.65, // weapon pedestal, centre of the bed
} as const;

/** Values derived from the base pickup + wheel config. */
export const PICKUP_DERIVED = {
  archCy: AXLE_Y - PICKUP.baseY,
  frontAxleZ: (WHEEL.axles.find((a) => a.steers) ?? WHEEL.axles[0]).z,
  rearAxleZ: WHEEL.axles.find((a) => !a.steers)?.z ?? -1.5,
} as const;

/** Cab A-pillar reference points (z, y) used by both the cab shape and the windshield. */
export const CAB_PILLARS = {
  cowl: { z: 0.95, y: 0.86 },
  aPillarTop: { z: 0.38, y: 1.4 },
} as const;

const _cowl = CAB_PILLARS.cowl;
const _aPillar = CAB_PILLARS.aPillarTop;
const _slope = Math.hypot(_cowl.z - _aPillar.z, _cowl.y - _aPillar.y);
const _wsOff = GEOMETRY.bevel + 0.015;

/** Windshield panel laid along the A-pillar slope. */
export const WINDSHIELD = {
  position: [
    0,
    (_cowl.y + _aPillar.y) / 2 + ((_cowl.z - _aPillar.z) / _slope) * _wsOff,
    (_cowl.z + _aPillar.z) / 2 + ((_aPillar.y - _cowl.y) / _slope) * _wsOff,
  ] as [number, number, number],
  rotationX: -Math.atan2(_cowl.z - _aPillar.z, _aPillar.y - _cowl.y), // top leans toward the rear
  length: _slope * 0.82,
} as const;
