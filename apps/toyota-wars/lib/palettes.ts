import { Vehicle } from "@toyota/models";

export type VehiclePalette = Vehicle.VehiclePalette;

export const PLAYER_PALETTE: VehiclePalette = {
  body: "#7f8a5a",
  cabin: "#626e46",
  accent: "#2c3327",
};

export const ALLY_PALETTES: Record<
  "tan" | "terracotta" | "sand",
  VehiclePalette
> = {
  tan: {
    body: "#87956a",
    cabin: "#667452",
    accent: "#2d3428",
  },
  terracotta: {
    body: "#6f7947",
    cabin: "#555e36",
    accent: "#262c21",
  },
  sand: {
    body: "#a0a982",
    cabin: "#797f61",
    accent: "#343b2d",
  },
};

export const ENEMY_PALETTES: Record<
  "slate" | "olive" | "steel",
  VehiclePalette
> = {
  slate: {
    body: "#5f7180",
    cabin: "#485966",
    accent: "#17232b",
  },
  olive: {
    body: "#7d929d",
    cabin: "#5c7180",
    accent: "#1b2a32",
  },
  steel: {
    body: "#566a74",
    cabin: "#42535d",
    accent: "#162128",
  },
};
