// apps/toyota-wars/feature/effects/fx-utils.ts
import * as THREE from "three";
import {
  Bezier,
  ConstantColor,
  Gradient,
  PiecewiseBezier,
  SizeOverLife,
  ColorOverLife,
  Vector3,
  Vector4,
  type ParticleSystem,
} from "three.quarks";

const FORWARD = new THREE.Vector3(0, 0, 1);
const DIRECTION = new THREE.Vector3();
const COLOR = new THREE.Color();

export function fadeOverLife() {
  return new SizeOverLife(
    new PiecewiseBezier([[new Bezier(1, 0.7, 0.2, 0), 0]]),
  );
}

export function smokeColorOverLife() {
  return new ColorOverLife(
    new Gradient(
      [
        [new Vector3(0.55, 0.52, 0.47), 0],
        [new Vector3(0.14, 0.14, 0.14), 1],
      ],
      [
        [0.55, 0],
        [0, 1],
      ],
    ),
  );
}

export function setStartColor(
  system: ParticleSystem,
  color: string,
  alpha = 1,
) {
  COLOR.set(color);
  const generator = system.startColor as ConstantColor | undefined;
  if (generator?.color) {
    generator.color.set(COLOR.r, COLOR.g, COLOR.b, alpha);
    return;
  }
  system.startColor = new ConstantColor(
    new Vector4(COLOR.r, COLOR.g, COLOR.b, alpha),
  );
}

export function placeSystem(
  system: ParticleSystem,
  position: Readonly<THREE.Vector3>,
  direction?: Readonly<THREE.Vector3>,
) {
  system.emitter.position.set(position.x, position.y, position.z);
  if (direction) {
    DIRECTION.copy(direction).normalize();
    system.emitter.quaternion.setFromUnitVectors(FORWARD, DIRECTION);
  }
  system.emitter.updateWorldMatrix(true, false);
}
