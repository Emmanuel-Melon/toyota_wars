import * as THREE from "three";
import type { SoldierAssets } from "../soldier.assets";

const X_AXIS = new THREE.Vector3(1, 0, 0);

/** Flat cloth strip following a curve, tapered, with a slight fold ripple. */
function createRibbon(points: THREE.Vector3[], width: number, segments = 28) {
  const curve = new THREE.CatmullRomCurve3(points);
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const edge = new THREE.Vector3();

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = curve.getPoint(t);
    const tangent = curve.getTangent(t);
    const side = new THREE.Vector3().crossVectors(tangent, X_AXIS).normalize();
    const normal = new THREE.Vector3().crossVectors(side, tangent).normalize();
    p.addScaledVector(normal, Math.sin(t * Math.PI * 5) * 0.006 * t);
    const half = width * (1 - 0.3 * t) * 0.5;

    for (const s of [-1, 1]) {
      edge.copy(p).addScaledVector(side, half * s);
      pos.push(edge.x, edge.y, edge.z);
      uv.push(s < 0 ? 0 : 1, t);
    }
    if (i < segments) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function createHeadExtras(mat: SoldierAssets["mat"], kadamol: boolean) {
  const skin = mat.skin as THREE.MeshStandardMaterial;

  const skinShade = skin.clone();
  skinShade.color.multiplyScalar(0.6);
  const lip = skin.clone();
  lip.color.multiplyScalar(0.8).lerp(new THREE.Color("#7a3b3b"), 0.35);

  const cupX = kadamol ? 0.14 : 0.118;
  const bandR = kadamol ? 0.145 : 0.125;

  const geo = {
    // face
    sclera: new THREE.SphereGeometry(0.012, 16, 12),
    iris: new THREE.CircleGeometry(0.0065, 18),
    pupil: new THREE.CircleGeometry(0.003, 12),
    lid: new THREE.SphereGeometry(0.0132, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
    brow: new THREE.CapsuleGeometry(0.0038, 0.03, 4, 8),
    lip: new THREE.CapsuleGeometry(0.004, 0.028, 4, 8),
    concha: new THREE.SphereGeometry(0.011, 12, 10),
    // kadamol
    crown: new THREE.SphereGeometry(0.113, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.55),
    band: new THREE.TorusGeometry(0.108, 0.014, 10, 40),
    knot: new THREE.SphereGeometry(0.02, 12, 10),
    neckWrap: new THREE.TorusGeometry(0.058, 0.014, 8, 28),
    tail: createRibbon(
      [
        new THREE.Vector3(-0.06, 0.05, -0.09),
        new THREE.Vector3(-0.1, -0.02, -0.11),
        new THREE.Vector3(-0.125, -0.12, -0.1),
        new THREE.Vector3(-0.12, -0.24, -0.08),
      ],
      0.07,
    ),
    // goggles
    goggleFrame: new THREE.TorusGeometry(0.029, 0.004, 8, 24),
    goggleBridge: new THREE.BoxGeometry(0.03, 0.008, 0.008),
    goggleBuckle: new THREE.BoxGeometry(0.01, 0.018, 0.008),
    // headset
    headband: new THREE.TorusGeometry(0.125, 0.006, 8, 36, Math.PI),
    cupPad: new THREE.TorusGeometry(0.024, 0.008, 8, 20),
    boom: new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(cupX, -0.03, 0.02),
        new THREE.Vector3(cupX - 0.005, -0.06, 0.075),
        new THREE.Vector3(0.08, -0.085, 0.112),
        new THREE.Vector3(0.04, -0.075, 0.105),
      ]),
      20,
      0.0035,
      6,
    ),
  };

  const cloth = new THREE.MeshStandardMaterial({ color: "#d6c8a6", roughness: 0.95, side: THREE.DoubleSide });
  const clothShade = new THREE.MeshStandardMaterial({ color: "#bfae88", roughness: 0.95, side: THREE.DoubleSide });

  const materials = {
    skinShade,
    lip,
    sclera: new THREE.MeshStandardMaterial({ color: "#efe9df", roughness: 0.3 }),
    iris: new THREE.MeshStandardMaterial({ color: "#3b2a1d", roughness: 0.35 }),
    pupil: new THREE.MeshBasicMaterial({ color: "#050505" }),
    brow: new THREE.MeshStandardMaterial({ color: "#17120f", roughness: 1 }),
    cloth,
    clothShade,
    frame: new THREE.MeshStandardMaterial({ color: "#1e1f1c", roughness: 0.5, metalness: 0.2 }),
    metal: new THREE.MeshStandardMaterial({ color: "#6b6f72", roughness: 0.35, metalness: 0.8 }),
    foam: new THREE.MeshStandardMaterial({ color: "#121212", roughness: 1 }),
  };

  return {
    geo,
    mat: materials,
    cupX,
    bandR,
    dispose() {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
    },
  };
}

export type HeadExtras = ReturnType<typeof createHeadExtras>;