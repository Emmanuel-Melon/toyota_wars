// lib/movement/movement.gama-pilot.ts
import * as THREE from "three";
import { MotionAgent, Seek, type SteeringBehavior } from "gama3d";

/**
 * Wraps a gama3d MotionAgent as a headless steering-force oracle.
 *
 * The agent is attached to a dummy THREE.Object3D that is never added to
 * the scene. Each tick we sync the dummy to the tank's position, reset
 * velocity, install the desired behaviors, call update() to accumulate the
 * force, then read lastSteering. The tank keeps its own kinematics; we
 * only consume the resulting direction.
 *
 * Velocity is deliberately zeroed each tick, so Seek yields a pure
 * "toward the target" direction. Velocity-dependent behaviors (Pursuit,
 * Wander, ObstacleAvoidance look-ahead) would need the tank's real
 * velocity fed in here instead.
 */
export class GamaSteeringPilot {
  private readonly _owner = new THREE.Object3D();
  private readonly _agent: MotionAgent;

  constructor() {
    this._agent = new MotionAgent({
      maxSpeed: 1, // magnitude is normalized away
      maxForce: 1, // clamped force; irrelevant for direction
      planar: true, // keep everything on XZ
      faceVelocity: false,
    });
    attachOwner(this._agent, this._owner);
  }

  /** Reset the oracle for this tick and place it at the tank. */
  begin(position: Readonly<THREE.Vector3>): void {
    this._owner.position.set(position.x, position.y, position.z);
    this._agent.velocity.set(0, 0, 0);
    this._agent.clearBehaviors();
  }

  /** Accumulate a seek force toward `target`. */
  seek(target: Readonly<THREE.Vector3>, weight = 1): void {
    // gama's Seek is typed for a mutable Vector3; it never writes to it.
    this._agent.addBehavior(new Seek(target as THREE.Vector3), weight);
  }

  /** Add any pre-built behavior (Separation, ObstacleAvoidance, ...). */
  add(behavior: SteeringBehavior, weight = 1): void {
    this._agent.addBehavior(behavior, weight);
  }

  /**
   * Run one oracle step and write the steering force into `out` as a
   * horizontal unit direction. Returns null when the force is effectively
   * zero (target coincides with the tank, or forces cancel).
   */
  consumeDirection(dt: number, out: THREE.Vector3): THREE.Vector3 | null {
    // MotionAgent.update expects a Time-like object with `delta`.
    this._agent.update({ delta: dt } as never);

    const force = this._agent.lastSteering;
    out.set(force.x, 0, force.z);
    if (out.lengthSq() < 1e-8) return null;
    return out.normalize();
  }

  /** Convenience: begin + seek + consume. */
  seekDirection(
    position: Readonly<THREE.Vector3>,
    target: Readonly<THREE.Vector3>,
    dt: number,
    out: THREE.Vector3,
  ): THREE.Vector3 | null {
    this.begin(position);
    this.seek(target);
    return this.consumeDirection(dt, out);
  }
}

/** The one place that papers over MotionAgent expecting a GameObject owner. */
function attachOwner(agent: MotionAgent, owner: THREE.Object3D): void {
  (agent as unknown as { owner: THREE.Object3D }).owner = owner;
}
