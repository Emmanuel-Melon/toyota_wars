"use client";

import { Billboard } from "@react-three/drei";
import { useRef } from "react";
import { useGameFrame } from "@/render-loop";
import type * as THREE from "three";
import { useArena } from "@/context/arena-context";
import { useMission } from "@/context/missions.context";

const ZONE_COLOR = "#d27a38";
const ZONE_HIGHLIGHT = "#ffd27a";
const ICON_BACKDROP = "#171611";

export function MissionObjectiveMarker() {
  const { activeObjective } = useMission();
  const arena = useArena();
  const beaconRef = useRef<THREE.Group>(null);
  const point = activeObjective?.targetPoint ?? null;
  const groundY = point ? arena.terrain.getHeight(point.x, point.z) : 0;

  useGameFrame(({ clock }) => {
    const beacon = beaconRef.current;
    if (!beacon) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.1) * 0.035;
    beacon.scale.setScalar(pulse);
  }, "presentation");

  if (!point || !activeObjective || activeObjective.radius <= 0) return null;

  return (
    <group position={[point.x, groundY, point.z]}>
      <mesh position={[0, 0.06, 0]} rotation-x={-Math.PI / 2} renderOrder={10}>
        <circleGeometry args={[activeObjective.radius, 96]} />
        <meshBasicMaterial
          color={ZONE_COLOR}
          transparent
          opacity={0.08}
          toneMapped={false}
          depthWrite={false}
          depthTest={false}
          fog={false}
        />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation-x={-Math.PI / 2} renderOrder={11}>
        <ringGeometry
          args={[
            Math.max(0.1, activeObjective.radius - 0.45),
            activeObjective.radius,
            96,
          ]}
        />
        <meshBasicMaterial
          color={ZONE_HIGHLIGHT}
          transparent
          opacity={0.9}
          toneMapped={false}
          depthWrite={false}
          depthTest={false}
          fog={false}
        />
      </mesh>
      <group ref={beaconRef}>
        <mesh position={[0, 5.5, 0]} renderOrder={12}>
          <cylinderGeometry args={[0.09, 0.09, 11, 8]} />
          <meshBasicMaterial
            color={ZONE_COLOR}
            transparent
            opacity={0.26}
            toneMapped={false}
            depthWrite={false}
            depthTest={false}
            fog={false}
          />
        </mesh>
        <Billboard position={[0, 11.5, 0]}>
          <mesh renderOrder={13}>
            <circleGeometry args={[0.82, 28]} />
            <meshBasicMaterial
              color={ICON_BACKDROP}
              transparent
              opacity={0.78}
              toneMapped={false}
              depthWrite={false}
              depthTest={false}
              fog={false}
            />
          </mesh>
          <group position={[0, 0, 0.02]}>
            <mesh position={[-0.2, 0, 0]} renderOrder={14}>
              <boxGeometry args={[0.08, 0.72, 0.06]} />
              <meshBasicMaterial
                color="#f3e9d2"
                toneMapped={false}
                depthWrite={false}
                depthTest={false}
                fog={false}
              />
            </mesh>
            <mesh position={[0.12, 0.17, 0]} renderOrder={14}>
              <boxGeometry args={[0.52, 0.3, 0.06]} />
              <meshBasicMaterial
                color={ZONE_COLOR}
                toneMapped={false}
                depthWrite={false}
                depthTest={false}
                fog={false}
              />
            </mesh>
          </group>
        </Billboard>
      </group>
    </group>
  );
}
