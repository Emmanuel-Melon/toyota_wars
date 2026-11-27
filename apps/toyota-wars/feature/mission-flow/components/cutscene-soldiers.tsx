"use client";

import { useMemo, useRef, useState } from "react";
import type { Group } from "three";
import { Soldier } from "@toyota/models";
import { useArena } from "@/context/arena-context";
import type {
  FlowActorAnchor,
  FlowActorPalette,
  FlowCutsceneActor,
} from "@/lib/mission-flow/mission-flow.types";
import { ALLY_SOLDIER_PALETTE, ENEMY_SOLDIER_PALETTE } from "@/lib/palettes";
import { useGameFrame } from "@/render-loop";
import { useMissionFlow, useMissionFlowRunner } from "../mission-flow.context";
import type { MissionFlowRunner } from "../mission-flow.store";

const RUN_CYCLES = 4;
const POSE_FPS = 20;

const PALETTE_BY_KEY: Record<FlowActorPalette, Soldier.SoldierPalette> = {
  ally: ALLY_SOLDIER_PALETTE,
  enemy: ENEMY_SOLDIER_PALETTE,
};

function anchorXZ(
  anchor: FlowActorAnchor,
  spawn: readonly [number, number],
  heading: number,
): readonly [number, number] {
  if (anchor.at === "world") {
    return [anchor.position[0], anchor.position[2]];
  }

  const rightX = Math.cos(heading);
  const rightZ = -Math.sin(heading);
  const forwardX = Math.sin(heading);
  const forwardZ = Math.cos(heading);

  return [
    spawn[0] + rightX * anchor.side + forwardX * anchor.forward,
    spawn[1] + rightZ * anchor.side + forwardZ * anchor.forward,
  ];
}

function groundPoint(
  anchor: FlowActorAnchor,
  spawn: readonly [number, number],
  heading: number,
  terrain: { getHeight: (x: number, z: number) => number },
): [number, number, number] {
  const [x, z] = anchorXZ(anchor, spawn, heading);
  return [x, terrain.getHeight(x, z) + Soldier.poses.standing.pelvisHeight, z];
}

type RunningSoldierProps = {
  actor: FlowCutsceneActor;
  from: [number, number, number];
  to: [number, number, number];
  durationMs: number;
  stepId: string;
  runner: MissionFlowRunner;
};

function RunningSoldier({
  actor,
  from,
  to,
  durationMs,
  stepId,
  runner,
}: RunningSoldierProps) {
  const groupRef = useRef<Group>(null);
  const poseTimer = useRef(0);
  const [posePhase, setPosePhase] = useState(0);
  const deltaX = to[0] - from[0];
  const deltaY = to[1] - from[1];
  const deltaZ = to[2] - from[2];
  const heading = Math.atan2(deltaX, deltaZ);
  const pose = useMemo(() => Soldier.poses.running(posePhase), [posePhase]);

  useGameFrame((_, delta) => {
    const runtime = runner.getRuntime();
    const progress =
      runtime.stepId === stepId && durationMs > 0
        ? Math.min(Math.max(runtime.elapsedMs / durationMs, 0), 1)
        : 1;
    const group = groupRef.current;

    if (group) {
      group.position.set(
        from[0] + deltaX * progress,
        from[1] + deltaY * progress,
        from[2] + deltaZ * progress,
      );
      group.rotation.y = heading;
    }

    poseTimer.current += delta;
    if (poseTimer.current >= 1 / POSE_FPS) {
      poseTimer.current = 0;
      setPosePhase(progress * RUN_CYCLES * Math.PI * 2);
    }
  }, "presentation");

  return (
    <group ref={groupRef} position={from} rotation={[0, heading, 0]}>
      <Soldier.Soldier pose={pose} palette={PALETTE_BY_KEY[actor.palette]} />
    </group>
  );
}

export function CutsceneSoldiers() {
  const flow = useMissionFlow();
  const runner = useMissionFlowRunner();
  const arena = useArena();
  const step = runner.getCurrentStep();
  const actors =
    flow.phase === "cutscene" && step?.type === "cutscene"
      ? (step.actors ?? [])
      : [];

  return (
    <>
      {actors.map((actor) => (
        <RunningSoldier
          key={actor.id}
          actor={actor}
          from={groundPoint(
            actor.from,
            arena.playerSpawn,
            arena.playerHeading,
            arena.terrain,
          )}
          to={groundPoint(
            actor.to,
            arena.playerSpawn,
            arena.playerHeading,
            arena.terrain,
          )}
          durationMs={step?.durationMs ?? 0}
          stepId={step?.id ?? ""}
          runner={runner}
        />
      ))}
    </>
  );
}
