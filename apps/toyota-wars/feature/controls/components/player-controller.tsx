"use client";

import { usePlayer } from "@/context/player-context";
import { useGameFrame } from "@/render-loop";

/** Steps the canonical player body after input has been captured. */
export function PlayerController() {
  const { playerBody: body, playerCommand: command, destroyed } = usePlayer();
  useGameFrame((_, delta) => {
    if (destroyed) {
      command.current.throttle = 0;
      command.current.steer = 0;
      command.current.desiredHeading = null;
      return;
    }
    body.step(command.current, delta);
  }, "playerSim");

  return null;
}
