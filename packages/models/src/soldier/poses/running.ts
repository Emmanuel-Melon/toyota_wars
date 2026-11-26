import type { SoldierPose } from "../soldier.types";
import { standing } from "./standing";

export function running(phase: number): SoldierPose {
  const swing = Math.sin(phase);
  const leftLift = Math.max(0, swing);
  const rightLift = Math.max(0, -swing);

  return {
    pelvisHeight: standing.pelvisHeight,
    arms: {
      [-1]: {
        elbow: [-0.26, 0.24 + 0.04 * leftLift, 0.02 - 0.12 * swing],
        hand: [-0.24, 0.12 * leftLift, 0.1 - 0.26 * swing],
      },
      [1]: {
        elbow: [0.26, 0.24 + 0.04 * rightLift, 0.02 + 0.12 * swing],
        hand: [0.24, 0.12 * rightLift, 0.1 + 0.26 * swing],
      },
    },
    legs: {
      [-1]: {
        hip: [-0.09, 0.1, 0.02],
        knee: [-0.1, -0.3 + 0.1 * leftLift, 0.04 + 0.2 * swing],
        ankle: [-0.1, -0.7 + 0.12 * leftLift, 0.34 * swing],
      },
      [1]: {
        hip: [0.09, 0.1, 0.02],
        knee: [0.1, -0.3 + 0.1 * rightLift, 0.04 - 0.2 * swing],
        ankle: [0.1, -0.7 + 0.12 * rightLift, -0.34 * swing],
      },
    },
  };
}
