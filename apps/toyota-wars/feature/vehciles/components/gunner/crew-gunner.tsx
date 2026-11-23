// apps/toyota-wars/feature/vehciles/gunner/crew-gunner.tsx
"use client";

import { type CrewGunnerPalette, resolvePalette } from "./crew-gunner.palette";
import { GunnerLowerBody } from "./gunner-lower-body";
import { GunnerTorso } from "./gunner-torso";
import { GunnerArms } from "./gunner-arms";
import { GunnerHead } from "./gunner-head";

type CrewGunnerProps = {
  palette?: CrewGunnerPalette;
  role?: "gunner" | "loader";
};

export function CrewGunner({ palette, role = "gunner" }: CrewGunnerProps) {
  const resolved = resolvePalette(palette);

  // Offset the loader slightly to the side/rear of the gunner
  const position = role === "loader" ? [0.35, -0.15, -0.65] : [0, -0.15, -0.45];
  const rotation = role === "loader" ? [0.12, -0.15, 0] : [0.1, 0, 0];

  return (
    <group
      position={position as [number, number, number]}
      rotation={rotation as [number, number, number]}
    >
      <GunnerLowerBody palette={resolved} />
      <GunnerTorso palette={resolved} />
      <GunnerArms palette={resolved} role={role} />
      <GunnerHead palette={resolved} />
    </group>
  );
}
