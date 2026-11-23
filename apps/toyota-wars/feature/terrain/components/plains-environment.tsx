// apps/toyota-wars/feature/terrain/components/plains-environment.tsx
"use client";

import { Sky } from "@react-three/drei";
import { useArena } from "@/context/arena-context";
import { usePlayer } from "@/context/player-context";
import { TerrainManager } from "./terrain-manager";
import { ArenaObstacles } from "./arena-obstacles";
import { GrassPatches } from "./grass-patches";
import { ArenaStructures } from "./arena-structures";
import { RoadNetworkManager } from "../../roads/components/road-network-manager";

export function PlainsEnvironment() {
  const { playerBody } = usePlayer();
  const arena = useArena();

  return (
    <>
      <color attach="background" args={["#c7b18b"]} />
      <fog attach="fog" args={["#c7b18b", 50, 200]} />
      <ambientLight intensity={1.8} />
      <directionalLight
        castShadow
        position={[-18, 28, 12]}
        intensity={3.2}
        color="#ffe0a1"
      />
      <Sky sunPosition={[-8, 4, -10]} turbidity={8} rayleigh={2.2} />

      {/* Infinite Chunk Manager streams terrain around the player */}
      <TerrainManager
        playerBody={playerBody}
        terrain={arena.terrain}
        chunkSize={arena.chunks.size}
        renderRadius={arena.chunks.renderRadius}
        segments={arena.chunks.segments}
      />

      {/* Road Network */}
      <RoadNetworkManager
        playerBody={playerBody}
        network={arena.roads}
        terrain={arena.terrain}
        roadRadius={280}
      />

      {/* Arena obstacles */}
      <ArenaObstacles obstacles={arena.obstacles} terrain={arena.terrain} />
      <ArenaStructures structures={arena.structures} />

      <GrassPatches
        playerBody={playerBody}
        terrain={arena.terrain}
        obstacles={arena.obstacles}
        roads={arena.roads}
        roadWidth={arena.roadWidth}
        bound={arena.bound}
      />
    </>
  );
}
