import * as THREE from "three";
import type { AgentContext, AgentPorts, AgentVec3 } from "@toyota/agents";
import type { Obstacle } from "@/lib/movement/movement.types";
import {
  findFiringRepositionPoint,
  type RepositionRequest,
} from "@/lib/tactics/tactics.reposition";
import { resolveFormationMovement } from "@/lib/tanks/tanks.formation";

const waypoint = new THREE.Vector3();

function toVector3(point: AgentVec3): THREE.Vector3 {
  return new THREE.Vector3(point.x, point.y, point.z);
}

export const agentPorts: AgentPorts = {
  resolveFormationMovement(context: AgentContext, arriveRadius, slowRadius) {
    return resolveFormationMovement(context, arriveRadius, slowRadius);
  },
  findFiringRepositionPoint(request) {
    const appRequest: RepositionRequest = {
      ...request,
      origin: toVector3(request.origin),
      target: toVector3(request.target),
      blockingObstacle: request.blockingObstacle as Obstacle | null,
      obstacles: request.obstacles as Obstacle[],
    };
    const found = findFiringRepositionPoint(appRequest, waypoint);
    if (!found) return null;
    return { x: waypoint.x, y: waypoint.y, z: waypoint.z };
  },
};
