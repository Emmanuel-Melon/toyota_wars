import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { getProceduralGroundTextures } from "../textures/ground.texture";

type Props = {
  size: number;
  chunkX: number;
  chunkZ: number;
  worldMin: [number, number];
  worldSpan: number;
  trackMap: THREE.Texture;
  wheelTrackMap: THREE.Texture;
};

export function TerrainChunkMaterial({
  size,
  chunkX,
  chunkZ,
  worldMin,
  worldSpan,
  trackMap,
  wheelTrackMap,
}: Props) {
  const { colorMap, roughnessMap } = useMemo(
    () => getProceduralGroundTextures(size / 12),
    [size],
  );

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: colorMap,
      roughnessMap,
      roughness: 0.85,
      metalness: 0.05,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTrack = { value: trackMap };
      shader.uniforms.uWheelTrack = { value: wheelTrackMap };
      shader.uniforms.uWorldMin = { value: new THREE.Vector2(...worldMin) };
      shader.uniforms.uWorldSpan = { value: worldSpan };
      shader.uniforms.uChunkOffset = {
        value: new THREE.Vector2(chunkX * size, chunkZ * size),
      };

      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
          varying vec2 vWorldXZ;
          uniform vec2 uChunkOffset;`,
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
          vWorldXZ = vec2(position.x, -position.y) + uChunkOffset;`,
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
          varying vec2 vWorldXZ;
          uniform sampler2D uTrack;
          uniform sampler2D uWheelTrack;
          uniform vec2 uWorldMin;
          uniform float uWorldSpan;`,
        )
        .replace(
          "#include <map_fragment>",
          `#include <map_fragment>
          vec2 trackUv = (vWorldXZ - uWorldMin) / uWorldSpan;
          float roadTrack = texture2D(uTrack, trackUv).r;
          float wheelTrack = texture2D(uWheelTrack, trackUv).a;
          float track = max(roadTrack, wheelTrack);
          diffuseColor.rgb *= mix(1.0, 0.45, track);`,
        );
    };
    return mat;
  }, [
    colorMap,
    roughnessMap,
    trackMap,
    wheelTrackMap,
    worldMin,
    worldSpan,
    chunkX,
    chunkZ,
    size,
  ]);

  useEffect(() => () => material.dispose(), [material]);
  return <primitive object={material} attach="material" />;
}
