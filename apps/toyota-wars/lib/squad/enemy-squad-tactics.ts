import * as THREE from "three";
import type { Obstacle } from "@/lib/movement/movement.types";
import { MOVEMENT_CONFIG } from "@/lib/movement/movement.config";
import { SQUAD_CONFIG } from "./squad.config";
import {
  ENEMY_TACTICAL_ROLE,
  type EnemyTacticalAssignment,
  type Point2D,
  type SquadOrderContext,
} from "./squad.types";
import {
  findFlankPoint,
  findPinPoint,
  flankVectorFor,
  resolveCoverObstacle,
} from "@/lib/tactics/tactics.cover";

export type EnemyTacticsMember = {
  id: string;
  position: Readonly<THREE.Vector3>;
  health: number;
};

export type EnemyTacticsInput = {
  members: readonly EnemyTacticsMember[];
  targetPositions: ReadonlyMap<string, THREE.Vector3>;
  obstacles: readonly Obstacle[];
  bound: number;
};

type CoverRequest = {
  origin: Readonly<THREE.Vector3>;
  target: Readonly<THREE.Vector3>;
  cover: Obstacle;
  obstacles: readonly Obstacle[];
  bound: number;
  bodyRadius: number;
  clearance: number;
  sampleCount: number;
  side: -1 | 1;
};

const CONFIG = SQUAD_CONFIG.enemyTactics;

export class EnemySquadTactics {
  private readonly assignments = new Map<string, EnemyTacticalAssignment>();

  public reset(): void {
    this.assignments.clear();
  }

  public apply(orders: Map<string, SquadOrderContext>): void {
    for (const [id, assignment] of this.assignments) {
      const order = orders.get(id);
      if (!order) continue;
      order.assignedRole = assignment.role;
      order.tactical = assignment;
      order.useOrbitTactic =
        assignment.role === ENEMY_TACTICAL_ROLE.FLANK ||
        assignment.role === ENEMY_TACTICAL_ROLE.FLANK_OR_REPOSITION;
    }
  }

  public evaluate(input: EnemyTacticsInput): void {
    this.assignments.clear();

    const active = input.members.filter(
      (member) =>
        member.health > 0 &&
        Number.isFinite(member.position.x) &&
        Number.isFinite(member.position.z) &&
        input.targetPositions.has(member.id),
    );

    const groups = new Map<THREE.Vector3, EnemyTacticsMember[]>();
    for (const member of active) {
      const target = input.targetPositions.get(member.id);
      if (!target) continue;
      const group = groups.get(target);
      if (group) group.push(member);
      else groups.set(target, [member]);
    }

    for (const [target, members] of groups) {
      const center = new THREE.Vector3();
      for (const member of members) center.add(member.position);
      center.multiplyScalar(1 / members.length);

      const nearby = members.filter((member) => {
        const dx = member.position.x - center.x;
        const dz = member.position.z - center.z;
        return dx * dx + dz * dz <= CONFIG.groupRadius * CONFIG.groupRadius;
      });
      if (nearby.length === 0) continue;

      const sorted = [...nearby].sort((a, b) => a.id.localeCompare(b.id));
      const cover = resolveCoverObstacle(
        sorted,
        target,
        input.obstacles,
        CONFIG.coverSearchRadius,
      );

      if (sorted.length >= CONFIG.splitThreshold && cover) {
        const pinCount = Math.max(1, Math.floor(sorted.length / 2));
        let flankIndex = 0;
        sorted.forEach((member, index) => {
          if (index < pinCount) {
            this.assignPin(member, target, cover, index, input);
          } else {
            this.assignFlank(
              member,
              target,
              cover,
              this.sideForIndex(flankIndex++),
              input,
            );
          }
        });
        continue;
      }

      sorted.forEach((member, index) => {
        if (cover) {
          this.assignFlank(
            member,
            target,
            cover,
            this.sideForIndex(index),
            input,
            ENEMY_TACTICAL_ROLE.FLANK_OR_REPOSITION,
          );
        } else {
          this.assignments.set(member.id, {
            role: ENEMY_TACTICAL_ROLE.FLANK_OR_REPOSITION,
          });
        }
      });
    }
  }

  private assignPin(
    member: EnemyTacticsMember,
    target: THREE.Vector3,
    cover: Obstacle,
    index: number,
    input: EnemyTacticsInput,
  ): void {
    const side = this.sideForIndex(index);
    const assignment: EnemyTacticalAssignment = {
      role: ENEMY_TACTICAL_ROLE.PIN,
      flankSide: side,
    };
    const point: Point2D = { x: 0, y: 0 };
    if (
      findPinPoint(this.requestFor(member, target, cover, side, input), point)
    ) {
      assignment.pinPoint = point;
    }
    this.assignments.set(member.id, assignment);
  }

  private assignFlank(
    member: EnemyTacticsMember,
    target: THREE.Vector3,
    cover: Obstacle,
    side: -1 | 1,
    input: EnemyTacticsInput,
    role: EnemyTacticalAssignment["role"] = ENEMY_TACTICAL_ROLE.FLANK,
  ): void {
    const assignment: EnemyTacticalAssignment = {
      role,
      flankSide: side,
    };
    const vector: Point2D = { x: 0, y: 0 };
    flankVectorFor(target, cover, side, vector);
    assignment.flankVector = vector;
    const point: Point2D = { x: 0, y: 0 };
    if (
      findFlankPoint(this.requestFor(member, target, cover, side, input), point)
    ) {
      assignment.flankPoint = point;
    }
    this.assignments.set(member.id, assignment);
  }

  private requestFor(
    member: EnemyTacticsMember,
    target: THREE.Vector3,
    cover: Obstacle,
    side: -1 | 1,
    input: EnemyTacticsInput,
  ): CoverRequest {
    return {
      origin: member.position,
      target,
      cover,
      obstacles: input.obstacles,
      bound: input.bound,
      bodyRadius: MOVEMENT_CONFIG.body.radius,
      clearance: CONFIG.clearance,
      sampleCount: CONFIG.sampleCount,
      side,
    };
  }

  private sideForIndex(index: number): -1 | 1 {
    return index % 2 === 0 ? -1 : 1;
  }
}
