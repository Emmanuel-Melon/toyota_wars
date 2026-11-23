// apps/toyota-wars/feature/vehciles/components/wheels/use-wheel-spin.ts
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";

import type { RefObject } from "react";
import { WHEEL } from "@/feature/vehciles/vehicles.config";
import type { VehicleMotion } from "@/feature/vehciles/vehicles.utils";

type Params = {
  steers: boolean;
  motionRef: RefObject<VehicleMotion>;
  detached: boolean;
  wrecked: boolean;
};

/**
 * Advances the wheel's spin angle and applies the steer angle each frame.
 * Returns the refs the component should attach so it can stay declarative.
 */
export function useWheelSpin({ steers, motionRef, detached, wrecked }: Params) {
  const steerRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const angleRef = useRef(0);

  useFrame((_, delta) => {
    if (detached || wrecked) return;
    const m = motionRef.current;
    angleRef.current += (m.speed / WHEEL.radius) * delta;
    if (spinRef.current) spinRef.current.rotation.x = angleRef.current;
    if (steerRef.current) steerRef.current.rotation.y = steers ? m.steer : 0;
  });

  return { steerRef, spinRef };
}
