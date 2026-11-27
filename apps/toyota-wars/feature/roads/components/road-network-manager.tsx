// apps/toyota-wars/feature/roads/components/road-network-manager.tsx
"use client";

import { memo, useEffect, useMemo } from "react";
import { Environment } from "@toyota/models";
import * as THREE from "three";
import type { RoadNetwork } from "@/lib/map/map.network";
import type { TerrainSampler } from "@/lib/map/map.terrain";

interface Props {
  focus: { readonly x: number; readonly z: number };
  bound: number;
  network: RoadNetwork;
  terrain: TerrainSampler;
  visibleRadius?: number;
}

export const RoadNetworkManager = memo(function RoadNetworkManager({
  focus,
  bound,
  network,
  terrain,
  visibleRadius,
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
      side: THREE.FrontSide,
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
    const radius = visibleRadius ?? Math.hypot(bound, bound);
    return {
      chunks: network.chunksNear(focus.x, focus.z, radius),
      sites: network.locationsNear(focus.x, focus.z, radius),
    };
  }, [bound, focus.x, focus.z, network, visibleRadius]);

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
