// soldier/poses/seated-loading.ts
import type { SoldierPose } from "../soldier.types";

export const seatedLoading: SoldierPose = {
  pelvisHeight: 0.38,
  arms: {
    [-1]: { elbow: [-0.28, 0.3, 0.1], hand: [-0.04, 0.26, 0.36] },
    [1]: { elbow: [0.3, 0.34, 0.06], hand: [0.12, 0.3, 0.34] },
  },
  legs: {
    [-1]: { hip: [-0.09, 0.1, 0.02], knee: [-0.15, 0.22, 0.26], ankle: [-0.17, -0.28, 0.3] },
    [1]: { hip: [0.09, 0.1, 0.02], knee: [0.15, 0.22, 0.26], ankle: [0.17, -0.28, 0.3] },
  },
};