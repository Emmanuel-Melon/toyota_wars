import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { getGroundLayers } from "../textures/ground.texture";

type Props = {
  size: number;
  chunkX: number;
  chunkZ: number;
  worldMin: [number, number]; // arena bound min corner
  worldSpan: number;
  trackMap: THREE.Texture;
};

export function TerrainChunkMaterial({
  size,
  chunkX,
  chunkZ,
  worldMin,
  worldSpan,
  trackMap,
}: Props) {
  const layers = useMemo(() => getGroundLayers(), []);

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      roughness: 1,
      roughnessMap: layers.roughness,
      metalness: 0.02,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uGrass = { value: layers.grass };
      shader.uniforms.uDirt = { value: layers.dirt };
      shader.uniforms.uRock = { value: layers.rock };
      shader.uniforms.uTrack = { value: trackMap };
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
          varying vec3 vWNormal;
          uniform vec2 uChunkOffset;`,
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
          vWorldXZ = vec2(position.x, -position.y) + uChunkOffset;`,
        )
        .replace(
          "#include <defaultnormal_vertex>",
          `#include <defaultnormal_vertex>
          vWNormal = inverseTransformDirection(transformedNormal, viewMatrix);`,
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
          varying vec2 vWorldXZ;
          varying vec3 vWNormal;
          uniform sampler2D uGrass;
          uniform sampler2D uDirt;
          uniform sampler2D uRock;
          uniform sampler2D uTrack;
          uniform vec2 uWorldMin;
          uniform float uWorldSpan;`,
        )
        .replace(
          "#include <map_fragment>",
          `vec2 layerUv = vWorldXZ * 0.06;
          vec3 grassC = texture2D(uGrass, layerUv).rgb;
          vec3 dirtC  = texture2D(uDirt, layerUv).rgb;
          vec3 rockC  = texture2D(uRock, layerUv * 2.0).rgb;

          // large-scale patchiness between grass and dirt
          float patch = texture2D(uGrass, vWorldXZ * 0.008).g;
          vec3 ground = mix(grassC, dirtC, smoothstep(0.35, 0.6, patch));

          // rock on steep slopes
          float slope = 1.0 - normalize(vWNormal).y;
          ground = mix(ground, rockC, smoothstep(0.18, 0.5, slope));

          // wheel tracks darken the ground
          vec2 trackUv = (vWorldXZ - uWorldMin) / uWorldSpan;
          float track = texture2D(uTrack, trackUv).r;
          ground *= mix(1.0, 0.45, track);

          diffuseColor.rgb *= ground;`,
        );
    };
    return mat;
  }, [layers, trackMap, worldMin, worldSpan, chunkX, chunkZ, size]);

  useEffect(() => () => material.dispose(), [material]);
  return <primitive object={material} attach="material" />;
}
