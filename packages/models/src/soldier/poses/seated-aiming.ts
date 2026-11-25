// soldier/poses/seated-aiming.ts
import type { SoldierPose } from "../soldier.types";

export const seatedAiming: SoldierPose = {
  pelvisHeight: 0.38, // ankle y (-0.28) minus the sole offset (-0.108)
  arms: {
    [-1]: { elbow: [-0.28, 0.32, 0.08], hand: [-0.13, 0.3, 0.3] },
    [1]: { elbow: [0.28, 0.32, 0.08], hand: [0.13, 0.3, 0.3] },
  },
  legs: {
    [-1]: { hip: [-0.09, 0.1, 0.02], knee: [-0.1, 0.14, 0.3], ankle: [-0.1, -0.28, 0.34] },
    [1]: { hip: [0.09, 0.1, 0.02], knee: [0.1, 0.14, 0.3], ankle: [0.1, -0.28, 0.34] },
  },
};