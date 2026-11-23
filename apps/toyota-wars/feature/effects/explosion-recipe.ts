// apps/toyota-wars/feature/effects/explosion-recipe.ts
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import {
  ApplyForce,
  Bezier,
  ColorOverLife,
  ConstantColor,
  ConstantValue,
  Gradient,
  IntervalValue,
  ParticleSystem,
  PiecewiseBezier,
  RotationOverLife,
  SizeOverLife,
  SphereEmitter,
  Vector3 as QuarkVector3,
  Vector4,
} from "three.quarks";

export type ExplosionMaterials = {
  fireball: THREE.MeshBasicMaterial;
  smoke: THREE.MeshBasicMaterial;
  sparks: THREE.MeshBasicMaterial;
};

export type ExplosionLayers = {
  fireball: ParticleSystem;
  smoke: ParticleSystem;
  sparks: ParticleSystem;
};

let softTexture: THREE.CanvasTexture | null = null;

export function getSoftTexture() {
  if (softTexture) return softTexture;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.6)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  softTexture = new THREE.CanvasTexture(canvas);
  softTexture.colorSpace = THREE.SRGBColorSpace;
  return softTexture;
}

function createSoftMaterial(blending: THREE.Blending) {
  return new THREE.MeshBasicMaterial({
    map: getSoftTexture(),
    color: 0xffffff,
    transparent: true,
    depthWrite: false,
    blending,
  });
}

export function useExplosionMaterials(): ExplosionMaterials {
  const materials = useMemo<ExplosionMaterials>(
    () => ({
      fireball: createSoftMaterial(THREE.AdditiveBlending),
      smoke: createSoftMaterial(THREE.NormalBlending),
      sparks: createSoftMaterial(THREE.AdditiveBlending),
    }),
    [],
  );

  useEffect(
    () => () => {
      materials.fireball.dispose();
      materials.smoke.dispose();
      materials.sparks.dispose();
    },
    [materials],
  );

  return materials;
}

function white() {
  return new ConstantColor(new Vector4(1, 1, 1, 1));
}

export function createFireball(material: THREE.MeshBasicMaterial) {
  return new ParticleSystem({
    duration: 1,
    looping: false,
    worldSpace: true,
    renderOrder: 1,
    emissionOverTime: new ConstantValue(0),
    emissionBursts: [
      {
        time: 0,
        count: new ConstantValue(28),
        cycle: 1,
        interval: 0,
        probability: 1,
      },
    ],
    shape: new SphereEmitter({ radius: 0.5, thickness: 1 }),
    startLife: new IntervalValue(0.4, 0.9),
    startSpeed: new IntervalValue(1, 4),
    startSize: new IntervalValue(1.5, 3.5),
    startColor: white(),
    material,
    behaviors: [
      new SizeOverLife(
        new PiecewiseBezier([[new Bezier(0.3, 1, 0.9, 0.2), 0]]),
      ),
      new ColorOverLife(
        new Gradient(
          [
            [new QuarkVector3(1, 0.95, 0.7), 0],
            [new QuarkVector3(1, 0.5, 0.1), 0.4],
            [new QuarkVector3(0.4, 0.05, 0), 1],
          ],
          [
            [1, 0],
            [0.8, 0.5],
            [0, 1],
          ],
        ),
      ),
    ],
  });
}

export function createExplosionSmoke(material: THREE.MeshBasicMaterial) {
  return new ParticleSystem({
    duration: 3,
    looping: false,
    worldSpace: true,
    renderOrder: 0,
    emissionOverTime: new ConstantValue(10),
    emissionBursts: [
      {
        time: 0.05,
        count: new ConstantValue(18),
        cycle: 1,
        interval: 0,
        probability: 1,
      },
    ],
    shape: new SphereEmitter({ radius: 0.7, thickness: 1 }),
    startLife: new IntervalValue(2, 4),
    startSpeed: new IntervalValue(0.5, 2),
    startSize: new IntervalValue(1.5, 3),
    startRotation: new IntervalValue(0, Math.PI * 2),
    startColor: white(),
    material,
    behaviors: [
      new SizeOverLife(
        new PiecewiseBezier([[new Bezier(0.4, 0.8, 1.2, 1.6), 0]]),
      ),
      new RotationOverLife(new IntervalValue(-0.6, 0.6)),
      new ApplyForce(new QuarkVector3(0, 1, 0), new ConstantValue(0.8)),
      new ColorOverLife(
        new Gradient(
          [
            [new QuarkVector3(0.25, 0.22, 0.2), 0],
            [new QuarkVector3(0.1, 0.1, 0.1), 1],
          ],
          [
            [0, 0],
            [0.55, 0.15],
            [0, 1],
          ],
        ),
      ),
    ],
  });
}

export function createSparks(material: THREE.MeshBasicMaterial) {
  return new ParticleSystem({
    duration: 1.5,
    looping: false,
    worldSpace: true,
    renderOrder: 2,
    emissionOverTime: new ConstantValue(0),
    emissionBursts: [
      {
        time: 0,
        count: new ConstantValue(60),
        cycle: 1,
        interval: 0,
        probability: 1,
      },
    ],
    shape: new SphereEmitter({ radius: 0.3, thickness: 1 }),
    startLife: new IntervalValue(0.4, 1.2),
    startSpeed: new IntervalValue(6, 14),
    startSize: new IntervalValue(0.08, 0.2),
    startColor: white(),
    material,
    behaviors: [
      new ApplyForce(new QuarkVector3(0, -1, 0), new ConstantValue(18)),
      new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.8, 0.5, 0), 0]])),
      new ColorOverLife(
        new Gradient(
          [
            [new QuarkVector3(1, 0.9, 0.5), 0],
            [new QuarkVector3(1, 0.4, 0.05), 1],
          ],
          [
            [1, 0],
            [0, 1],
          ],
        ),
      ),
    ],
  });
}

export function createExplosionLayers(
  materials: ExplosionMaterials,
): ExplosionLayers {
  return {
    fireball: createFireball(materials.fireball),
    smoke: createExplosionSmoke(materials.smoke),
    sparks: createSparks(materials.sparks),
  };
}

export function setExplosionScale(layers: ExplosionLayers, scale: number) {
  const value = Math.max(0.05, scale);
  layers.fireball.emitter.scale.setScalar(value);
  layers.smoke.emitter.scale.setScalar(value);
  layers.sparks.emitter.scale.setScalar(value);
}
