// apps/toyota-wars/feature/roads/components/road-network-manager.tsx
"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useGameFrame } from "@/render-loop";
import * as THREE from "three";
import type {
  PlacedLocation,
  RoadChunkRef,
  RoadNetwork,
} from "@/lib/map/map.network";
import type { TerrainSampler } from "@/lib/map/map.terrain";
import { createProceduralRoadTextures } from "@/lib/map/road-texture.generator";
import { buildRoadChunkGeometry } from "@/lib/map/road-chunk-geometry";
import { LocationSite } from "@/feature/scene/components/location-site";

type WorldPosition = { readonly x: number; readonly z: number };

interface Props {
  playerBody: { readonly position: WorldPosition };
  network: RoadNetwork;
  terrain: TerrainSampler; // the GRADED sampler
  roadRadius?: number; // keep >= fog far
  siteRadius?: number;
}

const CELL = 32;

const RoadChunk = memo(function RoadChunk({
  chunk,
  terrain,
  material,
}: {
  chunk: RoadChunkRef;
  terrain: TerrainSampler;
  material: THREE.Material;
}) {
  const geometry = useMemo(
    () => buildRoadChunkGeometry(chunk, terrain),
    [chunk, terrain],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh
      geometry={geometry}
      material={material}
      renderOrder={1}
      receiveShadow
    />
  );
});

export const RoadNetworkManager = memo(function RoadNetworkManager({
  playerBody,
  network,
  terrain,
  roadRadius = 280,
  siteRadius = 450,
}: Props) {
  // ONE shared material/texture set for the whole network
  const material = useMemo(() => {
    const t = createProceduralRoadTextures();
    for (const tex of [t.colorMap, t.roughnessMap]) {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
    }
    return new THREE.MeshStandardMaterial({
      map: t.colorMap,
      roughnessMap: t.roughnessMap,
      roughness: 0.92,
      metalness: 0.02,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
  }, []);
  useEffect(
    () => () => {
      material.map?.dispose();
      material.roughnessMap?.dispose();
      material.dispose();
    },
    [material],
  );

  const compute = () => {
    const { x, z } = playerBody.position;
    return {
      chunks: network.chunksNear(x, z, roadRadius),
      sites: network.locationsNear(x, z, siteRadius),
    };
  };
  const [view, setView] = useState<{
    chunks: RoadChunkRef[];
    sites: PlacedLocation[];
  }>(compute);
  const cell = useRef("");

  useGameFrame(() => {
    const { x, z } = playerBody.position;
    const key = `${Math.floor(x / CELL)},${Math.floor(z / CELL)}`;
    if (key === cell.current) return;
    cell.current = key;
    setView(compute());
  }, "presentation");

  return (
    <group>
      {view.chunks.map((c) => (
        <RoadChunk
          key={c.key}
          chunk={c}
          terrain={terrain}
          material={material}
        />
      ))}
      {view.sites.map((loc) => (
        <LocationSite key={loc.id} location={loc} />
      ))}
    </group>
  );
});
