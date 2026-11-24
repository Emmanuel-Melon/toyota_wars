// packages/models/src/weapons/components/mount-shared.tsx
import { useEffect, useMemo } from "react";
import { BoxGeometry, CylinderGeometry, MeshStandardMaterial } from "three";
import type { V3, VehiclePalette } from "../../vehicle/types";

export const SIDES = [-1, 1] as const;

export function useUnitBoxGeometry(): BoxGeometry {
  const geom = useMemo(() => new BoxGeometry(1, 1, 1), []);
  useEffect(() => () => geom.dispose(), [geom]);
  return geom;
}

export function MountAmmoFeed({
  from,
  to,
  links = 4,
}: {
  from: V3;
  to: V3;
  links?: number;
}) {
  const box = useUnitBoxGeometry();

  const trayMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#252523",
        roughness: 0.52,
        metalness: 0.65,
      }),
    [],
  );

  const roundMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#b3873f",
        roughness: 0.35,
        metalness: 0.82,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      trayMaterial.dispose();
      roundMaterial.dispose();
    };
  }, [trayMaterial, roundMaterial]);

  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  const span = Math.hypot(dx, dy, dz) || 0.01;
  const midX = (from[0] + to[0]) * 0.5;
  const midY = (from[1] + to[1]) * 0.5;
  const midZ = (from[2] + to[2]) * 0.5;
  const rollZ = Math.atan2(dy, dx);

  return (
    <group position={[midX, midY, midZ]} rotation={[0, 0, rollZ]}>
      {/* Sloped feed tray / chute */}
      <mesh
        position={[0, -0.015, 0]}
        scale={[span, 0.014, 0.11]}
        geometry={box}
        material={trayMaterial}
        castShadow
      />

      {/* Individual cartridge rounds / belt links riding along the chute */}
      {Array.from({ length: links }).map((_, idx) => {
        const t = links === 1 ? 0.5 : idx / (links - 1);
        const lx = -span * 0.38 + t * span * 0.76;
        return (
          <mesh
            key={idx}
            position={[lx, 0.006, 0]}
            scale={[0.018, 0.018, 0.085]}
            geometry={box}
            material={roundMaterial}
            castShadow
          />
        );
      })}
    </group>
  );
}

export function useUnitCylinderGeometry(
  radialSegments = 12,
): CylinderGeometry {
  const geom = useMemo(
    () => new CylinderGeometry(1, 1, 1, radialSegments),
    [radialSegments],
  );
  useEffect(() => () => geom.dispose(), [geom]);
  return geom;
}

export function MountBasePlate({ size }: { size: V3 }) {
  const box = useUnitBoxGeometry();
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#1e1e1c",
        roughness: 0.78,
        metalness: 0.35,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  return (
    <group position={[0, -0.13, 0]}>
      <mesh
        scale={size}
        geometry={box}
        material={material}
        castShadow
        receiveShadow
      />
      {/* Subtle mounting flange lip */}
      <mesh
        position={[0, -size[1] * 0.35, 0]}
        scale={[size[0] * 1.12, size[1] * 0.35, size[2] * 1.12]}
        geometry={box}
        material={material}
        castShadow
      />
    </group>
  );
}

export function MountAccent({
  palette,
  position,
  size,
}: {
  palette: VehiclePalette;
  position: V3;
  size: V3;
}) {
  const box = useUnitBoxGeometry();
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: palette.accent,
        roughness: 0.65,
        metalness: 0.25,
      }),
    [palette.accent],
  );
  useEffect(() => () => material.dispose(), [material]);

  return (
    <group position={position}>
      <mesh scale={size} geometry={box} material={material} castShadow />
      {/* Reinforced rim around ammo / accent housing */}
      <mesh
        position={[0, size[1] * 0.46, 0]}
        scale={[size[0] * 1.05, Math.min(0.03, size[1] * 0.16), size[2] * 1.05]}
        geometry={box}
        material={material}
        castShadow
      />
    </group>
  );
}

export function MountBody({
  position,
  size,
  color,
  metalness = 0.45,
  roughness = 0.55,
}: {
  position: V3;
  size: V3;
  color: string;
  metalness?: number;
  roughness?: number;
}) {
  const box = useUnitBoxGeometry();
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color,
        roughness,
        metalness,
      }),
    [color, roughness, metalness],
  );
  useEffect(() => () => material.dispose(), [material]);

  return (
    <group position={position}>
      <mesh scale={size} geometry={box} material={material} castShadow />
      {/* Top receiver rail / spine */}
      <mesh
        position={[0, size[1] * 0.5 + 0.015, 0]}
        scale={[size[0] * 0.55, 0.03, size[2] * 0.88]}
        geometry={box}
        material={material}
        castShadow
      />
    </group>
  );
}

export function MountDarkBox({ position, size }: { position: V3; size: V3 }) {
  const box = useUnitBoxGeometry();
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#1a1a1a",
        roughness: 0.52,
        metalness: 0.6,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  return <mesh position={position} scale={size} geometry={box} material={material} castShadow />;
}

export function MountRearGrips({
  span,
  z,
  armZ,
}: {
  span: number;
  z: number;
  armZ: number;
}) {
  const box = useUnitBoxGeometry();
  const gripMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#1b1b19",
        roughness: 0.82,
        metalness: 0.15,
      }),
    [],
  );
  const strutMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#262626",
        roughness: 0.5,
        metalness: 0.65,
      }),
    [],
  );
  useEffect(() => {
    return () => {
      gripMaterial.dispose();
      strutMaterial.dispose();
    };
  }, [gripMaterial, strutMaterial]);

  const armLength = Math.max(0.06, Math.abs(z - armZ) + 0.06);
  const armCenterZ = (z + armZ) * 0.5;

  return (
    <>
      {/* Crossbar grip */}
      <mesh
        position={[0, 0.02, z]}
        scale={[span + 0.06, 0.036, 0.036]}
        geometry={box}
        material={gripMaterial}
        castShadow
      />
      {/* Left/right spade grip arms + vertical handgrips */}
      {SIDES.map((side) => (
        <group key={side}>
          <mesh
            position={[side * (span * 0.5), 0.02, armCenterZ]}
            scale={[0.036, 0.036, armLength]}
            geometry={box}
            material={strutMaterial}
            castShadow
          />
          <mesh
            position={[side * (span * 0.46), -0.045, z]}
            rotation={[0.18, 0, 0]}
            scale={[0.032, 0.09, 0.032]}
            geometry={box}
            material={gripMaterial}
            castShadow
          />
        </group>
      ))}
    </>
  );
}