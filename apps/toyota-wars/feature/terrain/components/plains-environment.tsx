// apps/toyota-wars/feature/terrain/components/plains-environment.tsx
"use client";

import { Sky } from "@react-three/drei";
import { Environment } from "@toyota/models";
import { TIME_OF_DAY } from "@toyota/missions";
import { useArena } from "@/context/arena-context";
import { useCameraMode } from "@/context/camera-mode-context";
import { useMission } from "@/context/missions.context";
import { usePlayer } from "@/context/player-context";
import { isRoamMode } from "@/feature/camera/camera.types";
import { useDroneRoam } from "@/feature/camera/drone-roam.context";
import { TerrainManager } from "./terrain-manager";
import { GrassPatches } from "./grass-patches";
import { RoadNetworkManager } from "../../roads/components/road-network-manager";

type EnvironmentPreset = {
  background: string;
  fogColor: string;
  ambientIntensity: number;
  lightPosition: [number, number, number];
  lightIntensity: number;
  lightColor: string;
  sunPosition: [number, number, number];
  turbidity: number;
  rayleigh: number;
};

const ENVIRONMENT_PRESETS: Record<
  (typeof TIME_OF_DAY)[keyof typeof TIME_OF_DAY],
  EnvironmentPreset
> = {
  [TIME_OF_DAY.DAWN]: {
    background: "#d2a97f",
    fogColor: "#d8b38c",
    ambientIntensity: 1.1,
    lightPosition: [-16, 8, 12],
    lightIntensity: 2,
    lightColor: "#ffc38f",
    sunPosition: [-10, 0.8, 6],
    turbidity: 10,
    rayleigh: 2.6,
  },
  [TIME_OF_DAY.DAY]: {
    background: "#c7b18b",
    fogColor: "#c7b18b",
    ambientIntensity: 1.8,
    lightPosition: [-18, 28, 12],
    lightIntensity: 3.2,
    lightColor: "#ffe0a1",
    sunPosition: [-8, 4, -10],
    turbidity: 8,
    rayleigh: 2.2,
  },
  [TIME_OF_DAY.DUSK]: {
    background: "#49374f",
    fogColor: "#5b455f",
    ambientIntensity: 0.7,
    lightPosition: [16, 8, -12],
    lightIntensity: 1.5,
    lightColor: "#ff9d78",
    sunPosition: [10, 0.4, -8],
    turbidity: 12,
    rayleigh: 3,
  },
  [TIME_OF_DAY.NIGHT]: {
    background: "#070b16",
    fogColor: "#0a1020",
    ambientIntensity: 0.35,
    lightPosition: [-12, 18, 8],
    lightIntensity: 0.5,
    lightColor: "#8fa9ff",
    sunPosition: [8, -4, -10],
    turbidity: 2,
    rayleigh: 0.6,
  },
};

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
      <Sky
        sunPosition={preset.sunPosition}
        turbidity={preset.turbidity}
        rayleigh={preset.rayleigh}
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
    </>
  );
}
