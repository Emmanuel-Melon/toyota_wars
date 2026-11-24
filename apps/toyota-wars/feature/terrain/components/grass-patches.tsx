"use client";

import { useEffect, useRef } from "react";
import { Environment } from "@toyota/models";
import { useGameFrame } from "@/render-loop";
import type { ArenaObstacle } from "@/lib/map/arena";
import type { RoadNetwork } from "@/lib/map/map.network";
import type { TerrainSampler } from "@/lib/map/map.terrain";

type WorldPosition = { readonly x: number; readonly z: number };

interface GrassPatchesProps {
  playerBody: { readonly position: WorldPosition };
  terrain: TerrainSampler;
  obstacles?: readonly ArenaObstacle[];
  roads?: Pick<RoadNetwork, "distanceToRoad">;
  roadWidth?: number;
  bound?: number;
  areaSize?: number;
  count?: number;
  seed?: number;
}

function snappedPosition(x: number, z: number, step: number) {
  return {
    x: Math.round(x / step) * step,
    z: Math.round(z / step) * step,
  };
}

export function GrassPatches({
  playerBody,
  terrain,
  obstacles = [],
  roads,
  roadWidth = 0,
  bound,
  areaSize = 180,
  count = 900,
  seed = 17,
}: GrassPatchesProps) {
  const snapStep = Math.max(20, areaSize * 0.25);
  const initialCenter = useRef(
    snappedPosition(playerBody.position.x, playerBody.position.z, snapStep),
  ).current;
  const fieldRef = useRef<Environment.GrassPatchFieldHandle>(null);
  const cellRef = useRef({
    cx: Math.round(playerBody.position.x / snapStep),
    cz: Math.round(playerBody.position.z / snapStep),
    step: snapStep,
  });

  useEffect(() => {
    const cx = Math.round(playerBody.position.x / snapStep);
    const cz = Math.round(playerBody.position.z / snapStep);
    if (
      cellRef.current.cx === cx &&
      cellRef.current.cz === cz &&
      cellRef.current.step === snapStep
    ) {
      return;
    }
    cellRef.current = { cx, cz, step: snapStep };
    fieldRef.current?.scatter(cx * snapStep, cz * snapStep);
  }, [playerBody, snapStep]);

  useGameFrame(() => {
    const cx = Math.round(playerBody.position.x / snapStep);
    const cz = Math.round(playerBody.position.z / snapStep);
    if (
      cellRef.current.cx === cx &&
      cellRef.current.cz === cz &&
      cellRef.current.step === snapStep
    ) {
      return;
    }
    cellRef.current = { cx, cz, step: snapStep };
    fieldRef.current?.scatter(cx * snapStep, cz * snapStep);
  }, "presentation");

  return (
    <Environment.GrassPatchField
      ref={fieldRef}
      initialCenterX={initialCenter.x}
      initialCenterZ={initialCenter.z}
      terrain={terrain}
      obstacles={obstacles}
      roads={roads}
      roadWidth={roadWidth}
      bound={bound}
      areaSize={areaSize}
      count={count}
      seed={seed}
    />
  );
}
