// apps/toyota-wars/feature/vehciles/bed-weapon/pedestal.tsx
/** Static pedestal + column that holds the turret ring. */
export function Pedestal() {
  return (
    <>
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.26, 0.04, 14]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.5, 10]} />
        <meshStandardMaterial color="#222" roughness={0.7} metalness={0.3} />
      </mesh>
    </>
  );
}
