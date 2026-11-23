"use client";

import type { PlacedLocation } from "@/lib/map/map.network";

const WOOD = "#5a4632";

function Signpost() {
  return (
    <group>
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 3.2, 8]} />
        <meshStandardMaterial color={WOOD} roughness={0.9} />
      </mesh>
      {[0.4, -0.5].map((a, i) => (
        <mesh
          key={i}
          position={[0, 2.8 - i * 0.45, 0]}
          rotation={[0, a * Math.PI, 0]}
          castShadow
        >
          <boxGeometry args={[1.4, 0.3, 0.05]} />
          <meshStandardMaterial color="#c9b58a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export function LocationSite({ location }: { location: PlacedLocation }) {
  const [offsetX, offsetZ] = location.siteOffset ?? [0, 0];
  return (
    <group position={[location.x + offsetX, location.y, location.z + offsetZ]}>
      {location.kind === "crossroads" && <Signpost />}
    </group>
  );
}
