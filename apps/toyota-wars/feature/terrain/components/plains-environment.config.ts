import { TIME_OF_DAY } from "@toyota/missions";

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

export const ENVIRONMENT_PRESETS: Record<
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