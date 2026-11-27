import * as THREE from "three";

export type SmokeCloud = {
  id: number;
  position: THREE.Vector3;
  radius: number;
  height: number;
  remaining: number;
  team: "ally" | "enemy";
};

let nextId = 1;
const clouds = new Map<number, SmokeCloud>();

const segment = new THREE.Vector3();
const toCloud = new THREE.Vector3();
const closest = new THREE.Vector3();

export function addSmokeCloud(input: Omit<SmokeCloud, "id">): number {
  const id = nextId++;
  clouds.set(id, { ...input, id });
  return id;
}

export function removeSmokeCloud(id: number): void {
  clouds.delete(id);
}

export function clearSmokeClouds(): void {
  clouds.clear();
}

export function tickSmokeClouds(delta: number): void {
  if (delta <= 0) return;
  for (const [id, cloud] of clouds) {
    cloud.remaining -= delta;
    if (cloud.remaining <= 0) clouds.delete(id);
  }
}

export function getSmokeClouds(): readonly SmokeCloud[] {
  return Array.from(clouds.values());
}

export function isSmokeOccluded(
  from: Readonly<THREE.Vector3>,
  to: Readonly<THREE.Vector3>,
): boolean {
  for (const cloud of clouds.values()) {
    const bottom = cloud.position.y - cloud.height * 0.2;
    const top = cloud.position.y + cloud.height;

    let t0 = 0;
    let t1 = 1;
    const dy = to.y - from.y;
    if (Math.abs(dy) < 1e-6) {
      if (from.y < bottom || from.y > top) continue;
    } else {
      let ta = (bottom - from.y) / dy;
      let tb = (top - from.y) / dy;
      if (ta > tb) [ta, tb] = [tb, ta];
      t0 = Math.max(t0, ta);
      t1 = Math.min(t1, tb);
      if (t0 > t1) continue;
    }

    const dx = to.x - from.x;
    const dz = to.z - from.z;
    const fx = from.x - cloud.position.x;
    const fz = from.z - cloud.position.z;
    const lenSq = dx * dx + dz * dz;
    const t = THREE.MathUtils.clamp(
      lenSq < 1e-9 ? t0 : -(fx * dx + fz * dz) / lenSq,
      t0,
      t1,
    );
    const px = fx + dx * t;
    const pz = fz + dz * t;
    if (px * px + pz * pz <= cloud.radius * cloud.radius) return true;
  }
  return false;
}
