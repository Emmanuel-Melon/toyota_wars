// lib/combat/combat.hitboxes.ts
import type { TargetPart } from "./combat.types";

export const TANK_HIT_PARTS: TargetPart[] = [
  { part: "turret", offset: [0, 1.5, -0.35], radius: 1.15, priority: 3 },
  { part: "windshield", offset: [0, 1.18, 0.7], radius: 0.55, priority: 2 },
  { part: "windowFL", offset: [0.94, 1.17, 0.34], radius: 0.42, priority: 2 },
  { part: "windowFR", offset: [-0.94, 1.17, 0.34], radius: 0.42, priority: 2 },
  { part: "windowRL", offset: [0.94, 1.17, -0.48], radius: 0.42, priority: 2 },
  { part: "windowRR", offset: [-0.94, 1.17, -0.48], radius: 0.42, priority: 2 },
  { part: "windowRear", offset: [0, 1.18, -1.3], radius: 0.48, priority: 2 },
  { part: "hood", offset: [0, 0.78, 1.9], radius: 0.82, priority: 2 },
  { part: "doorFL", offset: [0.95, 0.75, 0.34], radius: 0.55, priority: 2 },
  { part: "doorFR", offset: [-0.95, 0.75, 0.34], radius: 0.55, priority: 2 },
  { part: "doorRL", offset: [0.95, 0.75, -0.48], radius: 0.55, priority: 2 },
  { part: "doorRR", offset: [-0.95, 0.75, -0.48], radius: 0.55, priority: 2 },
  { part: "wheelFL", offset: [1.425, -0.225, 1.5], radius: 0.62, priority: 2 },
  { part: "wheelFR", offset: [-1.425, -0.225, 1.5], radius: 0.62, priority: 2 },
  { part: "wheelRL", offset: [1.425, -0.225, -1.5], radius: 0.62, priority: 2 },
  {
    part: "wheelRR",
    offset: [-1.425, -0.225, -1.5],
    radius: 0.62,
    priority: 2,
  },
  { part: "body", offset: [0, 0.65, 0], radius: 1.9, priority: 0 },
];
