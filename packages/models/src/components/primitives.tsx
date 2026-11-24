import type { V3 } from "../types";

type BoxProps = {
  p: V3;
  s: V3;
  m: import("three").Material;
  r?: V3;
  shadow?: boolean;
};

type CylProps = {
  p: V3;
  r: number;
  len: number;
  m: import("three").Material;
  rot?: V3;
};

export function Box({ p, s, m, r, shadow = true }: BoxProps) {
  return (
    <mesh position={p} rotation={r} material={m} castShadow={shadow}>
      <boxGeometry args={s} />
    </mesh>
  );
}

export function Cyl({ p, r, len, m, rot = [0, 0, 0] }: CylProps) {
  return (
    <mesh position={p} rotation={rot} material={m} castShadow>
      <cylinderGeometry args={[r, r, len, 10]} />
    </mesh>
  );
}
