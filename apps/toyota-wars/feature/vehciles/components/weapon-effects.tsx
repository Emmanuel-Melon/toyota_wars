// apps/toyota-wars/feature/vehciles/components/weapon-effects.tsx
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import { useVehicleContext } from "@/context/vehicle-context";

export function WeaponEffects({ light = true }: { light?: boolean }) {
  const flashRef = useRef<THREE.PointLight>(null);
  const { recoilRef } = useVehicleContext();

  useFrame(() => {
    if (!flashRef.current) return;

    // If the barrel recoil is active (greater than 0), turn on/brighten the muzzle flash light
    const isFiring = recoilRef && recoilRef.current.barrel > 0.05;

    if (isFiring) {
      // Randomize intensity slightly per frame during firing for a flickering effect
      flashRef.current.intensity = 3 + Math.random() * 4;
    } else {
      flashRef.current.intensity = 0;
    }
  });

  return (
    <group position={[0, 0, 0.1]}>
      {/* Dynamic warm/yellow muzzle flash light casting light onto the vehicle and ground */}
      {light && (
        <pointLight
          ref={flashRef}
          color="#ffaa33"
          distance={6}
          intensity={0}
          decay={2}
        />
      )}

      {/* Procedural geometric muzzle flash burst (visible only when firing) */}
      <MuzzleFlashMesh />
    </group>
  );
}

function MuzzleFlashMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { recoilRef } = useVehicleContext();

  useFrame(() => {
    if (!meshRef.current) return;
    const isFiring = recoilRef && recoilRef.current.barrel > 0.05;
    meshRef.current.visible = !!isFiring;
    if (isFiring) {
      // Random scale twitch for organic flash look
      const scale = 0.8 + Math.random() * 0.5;
      meshRef.current.scale.set(scale, scale, scale * 1.5);
      meshRef.current.rotation.z = Math.random() * Math.PI * 2;
    }
  });

  return (
    <mesh
      ref={meshRef}
      visible={false}
      position={[0, 0, 0.1]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <coneGeometry args={[0.12, 0.3, 4]} />
      <meshBasicMaterial color="#fff4b8" transparent opacity={0.9} />
    </mesh>
  );
}
