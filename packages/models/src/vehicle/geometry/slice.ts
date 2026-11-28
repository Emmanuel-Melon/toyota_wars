// packages/models/src/vehicle/geometry/slice.ts
import { BufferGeometry, Float32BufferAttribute } from "three";

const STRIDE = 8; // px py pz nx ny nz u v

function lerpVert(a: number[], b: number[], t: number): number[] {
  return a.map((v, i) => v + (b[i] - v) * t);
}

/**
 * Keeps everything at or below `cutY` and clips triangles that straddle it.
 * Position, normal and uv are interpolated. Output is non-indexed, and
 * material groups are dropped (fine for the single-material cab shell).
 */
export function sliceGeometryBelowY(
  source: BufferGeometry,
  cutY: number,
): BufferGeometry {
  const geo = source.index ? source.toNonIndexed() : source;
  const pos = geo.getAttribute("position");
  const nor = geo.getAttribute("normal");
  const uv = geo.getAttribute("uv");

  const vert = (i: number): number[] => [
    pos.getX(i), pos.getY(i), pos.getZ(i),
    nor ? nor.getX(i) : 0, nor ? nor.getY(i) : 0, nor ? nor.getZ(i) : 0,
    uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0,
  ];

  const out: number[] = [];

  for (let i = 0; i < pos.count; i += 3) {
    const tri = [vert(i), vert(i + 1), vert(i + 2)];

    // Sutherland–Hodgman against the half-space y <= cutY
    const poly: number[][] = [];
    for (let k = 0; k < 3; k++) {
      const a = tri[k];
      const b = tri[(k + 1) % 3];
      const aIn = a[1] <= cutY;
      const bIn = b[1] <= cutY;
      if (aIn) poly.push(a);
      if (aIn !== bIn) {
        poly.push(lerpVert(a, b, (cutY - a[1]) / (b[1] - a[1])));
      }
    }
    if (poly.length < 3) continue;

    for (let k = 1; k < poly.length - 1; k++) {
      for (const v of [poly[0], poly[k], poly[k + 1]]) out.push(...v);
    }
  }

  if (geo !== source) geo.dispose();

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  for (let i = 0; i < out.length; i += STRIDE) {
    positions.push(out[i], out[i + 1], out[i + 2]);
    const nx = out[i + 3], ny = out[i + 4], nz = out[i + 5];
    const len = Math.hypot(nx, ny, nz) || 1;
    normals.push(nx / len, ny / len, nz / len);
    uvs.push(out[i + 6], out[i + 7]);
  }

  const result = new BufferGeometry();
  result.setAttribute("position", new Float32BufferAttribute(positions, 3));
  if (nor) result.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  else result.computeVertexNormals();
  if (uv) result.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  result.computeBoundingBox();
  result.computeBoundingSphere();
  return result;
}