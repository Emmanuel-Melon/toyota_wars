import type { ResolvedPalette } from "../../types";

type GunnerArmsProps = {
  palette: ResolvedPalette;
  role?: "gunner" | "loader";
};

export function GunnerArms({ palette, role = "gunner" }: GunnerArmsProps) {
  if (role === "loader") {
    return (
      <>
        <group position={[0.22, 0.48, -0.05]}>
          <mesh rotation={[0.5, 0, -0.1]} position={[0, -0.1, 0]} castShadow>
            <boxGeometry args={[0.12, 0.28, 0.12]} />
            <meshStandardMaterial color={palette.uniform} roughness={0.9} />
          </mesh>
          <mesh
            rotation={[-0.3, 0.4, 0]}
            position={[-0.08, -0.25, 0.12]}
            castShadow
          >
            <boxGeometry args={[0.1, 0.26, 0.1]} />
            <meshStandardMaterial color={palette.skin} roughness={0.8} />
          </mesh>
        </group>
        <group position={[-0.22, 0.48, -0.05]}>
          <mesh rotation={[0.4, 0, 0.2]} position={[0, -0.1, 0]} castShadow>
            <boxGeometry args={[0.12, 0.28, 0.12]} />
            <meshStandardMaterial color={palette.uniform} roughness={0.9} />
          </mesh>
          <mesh
            rotation={[-0.4, -0.2, 0]}
            position={[0.05, -0.24, 0.15]}
            castShadow
          >
            <boxGeometry args={[0.1, 0.26, 0.1]} />
            <meshStandardMaterial color={palette.skin} roughness={0.8} />
          </mesh>
        </group>
      </>
    );
  }

  return (
    <>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.22, 0.48, -0.05]}>
          <mesh
            rotation={[0.4, 0, side * -0.2]}
            position={[0, -0.1, 0]}
            castShadow
          >
            <boxGeometry args={[0.12, 0.28, 0.12]} />
            <meshStandardMaterial color={palette.uniform} roughness={0.9} />
          </mesh>
          <mesh
            rotation={[-0.5, side * 0.2, 0]}
            position={[side * -0.04, -0.24, 0.18]}
            castShadow
          >
            <boxGeometry args={[0.1, 0.26, 0.1]} />
            <meshStandardMaterial color={palette.skin} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </>
  );
}
