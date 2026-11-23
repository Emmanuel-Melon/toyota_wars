import { useEffect, useMemo } from "react";
import * as THREE from "three";
import {
  ApplyForce,
  Bezier,
  ConstantColor,
  ConstantValue,
  IntervalValue,
  ParticleSystem,
  PiecewiseBezier,
  RotationOverLife,
  SizeOverLife,
  SphereEmitter,
  Vector3 as QuarkVector3,
  Vector4,
} from "three.quarks";
import { getSoftTexture } from "./explosion-recipe";
import { smokeColorOverLife } from "./fx-utils";

export function useDamageSmokeMaterial() {
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: getSoftTexture(),
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);
  return material;
}

export function createDamageSmoke(material: THREE.MeshBasicMaterial) {
  return new ParticleSystem({
    duration: 1,
    looping: true,
    worldSpace: true,
    renderOrder: 2,
    emissionOverTime: new ConstantValue(12),
    shape: new SphereEmitter({ radius: 0.22, thickness: 1 }),
    startLife: new IntervalValue(1.2, 2.2),
    startSpeed: new IntervalValue(0.25, 0.8),
    startSize: new IntervalValue(0.55, 0.95),
    startRotation: new IntervalValue(0, Math.PI * 2),
    startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
    material,
    behaviors: [
      new SizeOverLife(
        new PiecewiseBezier([[new Bezier(0.55, 0.85, 1.1, 1.45), 0]]),
      ),
      new RotationOverLife(new IntervalValue(-0.3, 0.3)),
      new ApplyForce(new QuarkVector3(0, 0.6, 0), new ConstantValue(0.35)),
      smokeColorOverLife(),
    ],
  });
}
