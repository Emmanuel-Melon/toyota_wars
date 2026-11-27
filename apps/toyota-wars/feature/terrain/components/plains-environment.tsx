// apps/toyota-wars/feature/terrain/components/plains-environment.tsx
"use client";

import { Environment } from "@toyota/models";
import { TIME_OF_DAY } from "@toyota/missions";
import { useArena } from "@/context/arena-context";
import { useCameraMode } from "@/context/camera-mode-context";
import { useMission } from "@/context/missions.context";
import { usePlayer } from "@/context/player-context";
import { isRoamMode } from "@/feature/camera/camera.types";
import { useDroneRoam } from "@/feature/camera/drone-roam.context";
import { TerrainManager } from "./terrain-manager";
import { RoadNetworkManager } from "../../roads/components/road-network-manager";
import { ENVIRONMENT_PRESETS } from "./plains-environment.config";
import { GrassPatches } from "./grass-patches";
import { TreePatches } from "./tree-patches";

export function PlainsEnvironment() {
  const { playerBody } = usePlayer();
  const { mode } = useCameraMode();
  const { streamingFocus } = useDroneRoam();
  const arena = useArena();
  const { mission } = useMission();
  const preset = ENVIRONMENT_PRESETS[mission?.timeOfDay ?? TIME_OF_DAY.DAY];
  const focus = isRoamMode(mode) ? streamingFocus : playerBody;

  return (
    <>
      <color attach="background" args={[preset.background]} />
      <fog attach="fog" args={[preset.fogColor, 50, 200]} />
      <ambientLight intensity={preset.ambientIntensity} />
      <directionalLight
        castShadow
        position={preset.lightPosition}
        intensity={preset.lightIntensity}
        color={preset.lightColor}
      />

      <TerrainManager
        bound={arena.bound}
        terrain={arena.terrain}
        chunkSize={arena.chunks.size}
        segments={arena.chunks.segments}
      />

      <RoadNetworkManager
        bound={arena.bound}
        network={arena.roads}
        terrain={arena.terrain}
      />

      {/* Arena obstacles */}
      <Environment.ArenaObstacles
        obstacles={arena.obstacles}
        terrain={arena.terrain}
      />
      <Environment.ArenaStructures structures={arena.structures} />

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