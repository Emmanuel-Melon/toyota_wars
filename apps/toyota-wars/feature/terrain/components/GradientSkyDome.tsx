// import { useEffect, useMemo } from "react";
// import * as THREE from "three";
// import { TIME_OF_DAY } from "@toyota/missions";
// import { ENVIRONMENT_PRESETS } from "./plains-environment.config";

// type TimeOfDay = (typeof TIME_OF_DAY)[keyof typeof TIME_OF_DAY];

// type GradientSkyDomeProps = {
//   timeOfDay: TimeOfDay;
//   radius?: number;
// };

// const vertexShader = /* glsl */ `
//   varying vec3 vWorldPosition;

//   void main() {
//     vec4 worldPosition = modelMatrix * vec4(position, 1.0);
//     vWorldPosition = worldPosition.xyz;
//     gl_Position = projectionMatrix * viewMatrix * worldPosition;
//   }
// `;

// const fragmentShader = /* glsl */ `
//   uniform vec3 uHorizonColor;
//   uniform vec3 uZenithColor;

//   varying vec3 vWorldPosition;

//   void main() {
//     // Normalize direction from origin so gradient tracks vertical angle
//     vec3 dir = normalize(vWorldPosition);

//     // Clamp vertical factor from horizon (0.0) to overhead zenith (1.0)
//     float h = clamp(dir.y, 0.0, 1.0);

//     // Smooth curve for a more natural sky transition than a linear ramp
//     float factor = pow(h, 0.55);

//     vec3 color = mix(uHorizonColor, uZenithColor, factor);
//     gl_FragColor = vec4(color, 1.0);

//     #include <tonemapping_fragment>
//     #include <colorspace_fragment>
//   }
// `;

// export function GradientSkyDome({
//   timeOfDay,
//   radius = 250,
// }: GradientSkyDomeProps) {
//   const preset = ENVIRONMENT_PRESETS[timeOfDay];

//   const uniforms = useMemo(
//     () => ({
//       uHorizonColor: { value: new THREE.Color(preset.horizonColor) },
//       uZenithColor: { value: new THREE.Color(preset.zenithColor) },
//     }),
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     []
//   );

//   useEffect(() => {
//     uniforms.uHorizonColor.value.set(preset.horizonColor);
//     uniforms.uZenithColor.value.set(preset.zenithColor);
//   }, [preset.horizonColor, preset.zenithColor, uniforms]);

//   return (
//     <mesh name="gradient-sky-dome" scale={[-1, 1, 1]}>
//       <sphereGeometry args={[radius, 32, 24]} />
//       <shaderMaterial
//         vertexShader={vertexShader}
//         fragmentShader={fragmentShader}
//         uniforms={uniforms}
//         side={THREE.BackSide}
//         depthWrite={false}
//         fog={false}
//       />
//     </mesh>
//   );
// }
