"use client";

import { useRef } from "react";
import { useGameFrame } from "@/render-loop";
import type * as THREE from "three";
import { useArena } from "@/context/arena-context";
import { useCombat } from "@/context/combat-context";
import { useBattle } from "@/context/battle-context";
import { ALLY_ATTACK_MODE } from "@/lib/squad/squad.types";

export function FireDesignationMarker() {
  const { fireDesignation, attackOrder } = useCombat();
  const focusTargetId =
    attackOrder?.mode === ALLY_ATTACK_MODE.FOCUS
      ? attackOrder.targetId
      : undefined;
  const { registry } = useBattle();
  const arena = useArena();
  const markerRef = useRef<THREE.Group>(null);

  useGameFrame(({ clock }) => {
    const marker = markerRef.current;
    const targetId = fireDesignation?.targetId ?? focusTargetId;
    if (!marker || (!targetId && !fireDesignation)) return;
    const tracked = targetId ? registry.get(targetId) : undefined;
    if (!tracked && !fireDesignation) return;
    const x = tracked?.position.x ?? fireDesignation?.point.x ?? 0;
    const z = tracked?.position.z ?? fireDesignation?.point.z ?? 0;
    const y = tracked?.position.y ?? arena.terrain.getHeight(x, z);
    marker.position.set(x, y, z);
    marker.scale.setScalar(1 + Math.sin(clock.elapsedTime * 4) * 0.05);
  }, "presentation");

  if (!fireDesignation && !focusTargetId) return null;

  return (
    <group ref={markerRef}>
      <mesh position={[0, 0.08, 0]} rotation-x={-Math.PI / 2} renderOrder={12}>
        <ringGeometry args={[2.2, 2.8, 40]} />
        <meshBasicMaterial
          color="#ff7a3d"
          transparent
          opacity={0.9}
          toneMapped={false}
          depthWrite={false}
          depthTest={false}
          fog={false}
        />
      </mesh>
      <mesh position={[0, 5, 0]} renderOrder={12}>
        <cylinderGeometry args={[0.06, 0.06, 10, 8]} />
        <meshBasicMaterial
          color="#ff7a3d"
          transparent
          opacity={0.3}
          toneMapped={false}
          depthWrite={false}
          depthTest={false}
          fog={false}
        />
      </mesh>
    </group>
  );
}
