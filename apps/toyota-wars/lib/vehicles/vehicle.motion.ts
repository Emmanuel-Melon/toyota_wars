export const VEHICLE_STEERING = {
  wheelbase: 3.0,
  maxSteer: 0.5,
} as const;

export type VehicleMotion = { speed: number; steer: number };
export type MotionSource = { speed: number; heading: number };

export function steerFromYawRate(speed: number, yawRate: number): number {
  if (Math.abs(speed) < 0.5) return 0;
  const a = Math.atan((VEHICLE_STEERING.wheelbase * yawRate) / speed);
  return Math.max(
    -VEHICLE_STEERING.maxSteer,
    Math.min(VEHICLE_STEERING.maxSteer, a),
  );
}

export function updateVehicleMotion(
  motion: VehicleMotion,
  previousHeading: { current: number },
  state: MotionSource,
  delta: number,
): void {
  let headingDelta = state.heading - previousHeading.current;
  headingDelta = Math.atan2(Math.sin(headingDelta), Math.cos(headingDelta));
  previousHeading.current = state.heading;

  motion.speed = state.speed;
  motion.steer = steerFromYawRate(
    state.speed,
    headingDelta / Math.max(delta, 1e-4),
  );
}
