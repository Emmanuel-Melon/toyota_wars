// apps/toyota-wars/feature/roads/components/road-network-manager.tsx
"use client";

import { memo, useEffect, useMemo } from "react";
import { Environment } from "@toyota/models";
import * as THREE from "three";
import type { RoadNetwork } from "@/lib/map/map.network";
import type { TerrainSampler } from "@/lib/map/map.terrain";

interface Props {
  bound: number;
  network: RoadNetwork;
  terrain: TerrainSampler;
}

export const RoadNetworkManager = memo(function RoadNetworkManager({
  bound,
  network,
  terrain,
}: Props) {
  const material = useMemo(() => {
    const t = Environment.createProceduralRoadTextures();
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

  const view = useMemo(() => {
    const radius = Math.hypot(bound, bound);
    return {
      chunks: network.chunksNear(0, 0, radius),
      sites: network.locationsNear(0, 0, radius),
    };
  }, [bound, network]);

  return (
    <group>
      {view.chunks.map((c) => (
        <Environment.RoadChunk
          key={c.key}
          chunk={c}
          terrain={terrain}
          material={material}
        />
      ))}
      {view.sites.map((loc) => (
        <Environment.LocationSite key={loc.id} location={loc} />
      ))}
    </group>
  );
});
