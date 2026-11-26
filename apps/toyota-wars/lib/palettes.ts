import { Soldier, Vehicle } from "@toyota/models";

export type VehiclePalette = Vehicle.VehiclePalette;
export type SoldierPalette = Soldier.SoldierPalette;

export const ALLY_SOLDIER_PALETTE: SoldierPalette = {
  skin: "#8d5b4c",
  helmet: "#2b3028",
  lens: "#2f5560",
  boots: "#1c1a17",
  glove: "#2a2d26",
  vest: "#1f241d",
  uniform: "#343d31",
  gear: "#3b4036",
};

export const ENEMY_SOLDIER_PALETTE: SoldierPalette = {
  skin: "#a06f5a",
  helmet: "#303a3c",
  lens: "#7b3f3f",
  boots: "#201d1d",
  glove: "#252a2b",
  vest: "#2b3436",
  uniform: "#3d4a4d",
  gear: "#4b5557",
};

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
