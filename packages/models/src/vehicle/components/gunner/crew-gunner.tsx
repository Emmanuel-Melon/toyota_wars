import type { CrewGunnerPalette } from "../../types";
import type { V3 } from "../../types";
import { GunnerArms } from "./gunner-arms";
import { GunnerHead } from "./gunner-head";
import { GunnerLowerBody } from "./gunner-lower-body";
import { GunnerTorso } from "./gunner-torso";
import { resolveGunnerPalette } from "./crew-gunner.palette";

export type CrewGunnerProps = {
  palette?: CrewGunnerPalette;
  role?: "gunner" | "loader";
};

export function CrewGunner({ palette, role = "gunner" }: CrewGunnerProps) {
  const resolved = resolveGunnerPalette(palette);
  const position: V3 =
    role === "loader" ? [0.35, -0.15, -0.65] : [0, -0.15, -0.45];
  const rotation: V3 = role === "loader" ? [0.12, -0.15, 0] : [0.1, 0, 0];

  return (
    <group position={position} rotation={rotation}>
      <GunnerLowerBody palette={resolved} role={role} />
      <GunnerTorso palette={resolved} />
      <GunnerArms palette={resolved} role={role} />
      <GunnerHead palette={resolved} />
    </group>
  );
}
