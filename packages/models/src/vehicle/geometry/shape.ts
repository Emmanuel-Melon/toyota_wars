import * as THREE from "three";

export function extrudeSide(
  shape: THREE.Shape,
  width: number,
  bevel: number,
): THREE.ExtrudeGeometry {
  const depth = width - 2 * bevel;
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 12,
  });
  geometry.rotateY(-Math.PI / 2);
  geometry.translate(depth / 2, 0, 0);
  return geometry;
}

export function lineWithArch(
  shape: THREE.Shape,
  centerZ: number,
  radius: number,
  archCenterY: number,
): void {
  const startAngle = Math.asin(-archCenterY / radius);
  shape.lineTo(centerZ - radius * Math.cos(startAngle), 0);
  const steps = 14;
  for (let index = 0; index <= steps; index++) {
    const angle =
      Math.PI - startAngle - ((Math.PI - 2 * startAngle) * index) / steps;
    shape.lineTo(
      centerZ + radius * Math.cos(angle),
      archCenterY + radius * Math.sin(angle),
    );
  }
}
