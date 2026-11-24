"use client";

import { Canvas } from "@react-three/fiber";
import { VehicleProvider } from "@/context/vehicle-context";
import { VehicleBody } from "@/feature/vehciles/components/vehicle-body";
import { WeaponMount } from "@/feature/weapons/components/mounts";
import { PLAYER_PALETTE } from "@/lib/palettes";
import { VEHICLE_MODELS } from "@/lib/vehicles/vehicle.config";
import type { VehicleModel } from "@/lib/vehicles/vehicle.types";
import { WEAPONS } from "@/lib/weapons/weapon.config";

export function VehiclePreview({ model }: { model: VehicleModel }) {
  const weapon = WEAPONS[model.weapon];

  return (
    <Canvas
      key={model.id}
      dpr={[1, 1.5]}
      camera={{ position: [6, 3.5, 7], fov: 34 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={1.4} />
      <directionalLight position={[3, 5, 4]} intensity={2.1} />
      <directionalLight
        position={[-3, 2, -4]}
        intensity={0.7}
        color="#9db5c8"
      />
      <VehicleProvider
        value={{
          unitId: model.id,
          team: "ally",
          palette: PLAYER_PALETTE,
          model: model.id,
          platform: model.platform,
          weapon,
          health: 1,
          maxHealth: 1,
          wrecked: false,
        }}
      >
        <group rotation={[0, -0.45, 0]}>
          <VehicleBody
            model={model.id}
            palette={PLAYER_PALETTE}
            health={1}
            maxHealth={1}
            showHealthBar={false}
            seed={0.35}
          />
          <group position={model.frame.mountPosition}>
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.16, 0.2, 0.8, 12]} />
              <meshStandardMaterial color={PLAYER_PALETTE.accent} />
            </mesh>
            <group position={[0, 0.85, 0]}>
              <WeaponMount
                kind={weapon.visual.mount}
                palette={PLAYER_PALETTE}
              />
            </group>
          </group>
        </group>
      </VehicleProvider>
    </Canvas>
  );
}
