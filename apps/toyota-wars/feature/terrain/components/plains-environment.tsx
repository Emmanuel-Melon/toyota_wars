// apps/toyota-wars/feature/terrain/components/plains-environment.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Environment } from "@toyota/models";
import { TIME_OF_DAY } from "@toyota/missions";
import { useArena } from "@/context/arena-context";
import { useCameraMode } from "@/context/camera-mode-context";
import { useMission } from "@/context/missions.context";
import { usePlayer } from "@/context/player-context";
import { isRoamMode } from "@/feature/camera/camera.types";
import { WORLD_FOG_CONFIG } from "@/feature/camera/camera.config";
import { useDroneRoam } from "@/feature/camera/drone-roam.context";
import { useGameFrame } from "@/render-loop";
import { TerrainManager } from "./terrain-manager";
import { useWheelEmitters, WHEEL_IDS } from "../hooks/use-wheel-emitters";
import { RoadNetworkManager } from "../../roads/components/road-network-manager";
import { ENVIRONMENT_PRESETS } from "./plains-environment.config";
import { GrassPatches } from "./grass-patches";
import { TreePatches } from "./tree-patches";

type WorldPoint = { readonly x: number; readonly z: number };
type FocusSource = { readonly position: WorldPoint };

function snapFocus(focus: FocusSource, step: number): WorldPoint {
  return {
    x: Math.round(focus.position.x / step) * step,
    z: Math.round(focus.position.z / step) * step,
  };
}

function samePoint(a: WorldPoint, b: WorldPoint): boolean {
  return a.x === b.x && a.z === b.z;
}

export function PlainsEnvironment() {
  const { playerBody } = usePlayer();
  const { mode } = useCameraMode();
  const { streamingFocus } = useDroneRoam();
  const arena = useArena();
  const { mission } = useMission();
  const preset = ENVIRONMENT_PRESETS[mission?.timeOfDay ?? TIME_OF_DAY.DAY];
  const focus = isRoamMode(mode) ? streamingFocus : playerBody;
  const snapStep = Math.max(40, arena.chunks.size);
  const [focusPoint, setFocusPoint] = useState(() =>
    snapFocus(focus, snapStep),
  );
  const focusPointRef = useRef(focusPoint);
  const visibleRadius = Math.max(
    400,
    arena.chunks.size * (arena.chunks.renderRadius + 0.5),
  );

  const trackSystem = useMemo(
    () =>
      new Environment.TrackSystem(
        -arena.bound,
        -arena.bound,
        Math.max(1, arena.bound * 2),
      ),
    [arena.bound],
  );

  useEffect(() => () => trackSystem.dispose(), [trackSystem]);

  const isOffRoad = useCallback(() => {
    const { x, z } = playerBody.position;
    return arena.roads.distanceToRoad(x, z) > arena.roadWidth / 2 + 2;
  }, [arena.roads, arena.roadWidth, playerBody]);

  const getEmitters = useWheelEmitters(playerBody, isOffRoad);

  useGameFrame((_, dt) => {
    const emitters = getEmitters();
    if (emitters.length === 0) {
      trackSystem.clearWheelHistory();
    } else {
      trackSystem.recordWheels(
        emitters.map((emitter, index) => ({
          id: WHEEL_IDS[index] ?? `wheel-${index}`,
          x: emitter.x,
          z: emitter.z,
        })),
        emitters[0]?.strength ?? 0,
      );
    }
    trackSystem.update(dt);
  }, "vfx");

  useEffect(() => {
    const next = snapFocus(focus, snapStep);
    if (samePoint(focusPointRef.current, next)) return;
    focusPointRef.current = next;
    setFocusPoint(next);
  }, [focus, snapStep]);

  useGameFrame(() => {
    const next = snapFocus(focus, snapStep);
    if (samePoint(focusPointRef.current, next)) return;
    focusPointRef.current = next;
    setFocusPoint(next);
  }, "presentation");

  return (
    <>
      <color attach="background" args={[preset.background]} />
      <fog
        attach="fog"
        args={[preset.fogColor, WORLD_FOG_CONFIG.near, WORLD_FOG_CONFIG.far]}
      />
      <ambientLight intensity={preset.ambientIntensity} />
      <directionalLight
        castShadow
        position={preset.lightPosition}
        intensity={preset.lightIntensity}
        color={preset.lightColor}
      />

      <TerrainManager
        focus={focusPoint}
        bound={arena.bound}
        terrain={arena.terrain}
        network={arena.roads}
        wheelTrackMap={trackSystem.texture}
        chunkSize={arena.chunks.size}
        segments={arena.chunks.segments}
        renderRadius={arena.chunks.renderRadius}
      />

      <Environment.WheelDust
        getEmitters={getEmitters}
        terrain={arena.terrain}
      />

      <RoadNetworkManager
        focus={focusPoint}
        visibleRadius={visibleRadius}
        bound={arena.bound}
        network={arena.roads}
        terrain={arena.terrain}
      />

      <Environment.ArenaObstacles
        obstacles={arena.obstacles}
        terrain={arena.terrain}
        focus={focusPoint}
        visibleRadius={visibleRadius}
      />
      <Environment.ArenaStructures
        structures={arena.structures}
        focus={focusPoint}
        visibleRadius={visibleRadius}
      />

      <GrassPatches
        playerBody={focus}
        terrain={arena.terrain}
        obstacles={arena.obstacles}
        roads={arena.roads}
        roadWidth={arena.roadWidth}
        bound={arena.bound}
      />
      <TreePatches
        playerBody={focus}
        terrain={arena.terrain}
        obstacles={arena.obstacles}
        roads={arena.roads}
        roadWidth={arena.roadWidth}
        bound={arena.bound}
      />
    </>
  );
}
