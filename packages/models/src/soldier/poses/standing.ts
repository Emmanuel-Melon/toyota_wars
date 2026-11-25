// soldier/poses/standing.ts
import type { SoldierPose } from "../soldier.types";

// First pass: relaxed stance, arms hanging. Feet bottom out at y = -(0.7 + 0.108).
export const standing: SoldierPose = {
  pelvisHeight: 0.81,
  arms: {
    [-1]: { elbow: [-0.26, 0.24, 0.02], hand: [-0.24, 0.0, 0.1] },
    [1]: { elbow: [0.26, 0.24, 0.02], hand: [0.24, 0.0, 0.1] },
  },
  legs: {
    [-1]: { hip: [-0.09, 0.1, 0.02], knee: [-0.1, -0.3, 0.04], ankle: [-0.1, -0.7, 0.0] },
    [1]: { hip: [0.09, 0.1, 0.02], knee: [0.1, -0.3, 0.04], ankle: [0.1, -0.7, 0.0] },
  },
};