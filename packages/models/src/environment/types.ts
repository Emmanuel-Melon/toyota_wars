// packages/models/src/environment/types.ts
export type TerrainSampler = {
  readonly getHeight: (worldX: number, worldZ: number) => number;
  readonly getVehicleHeight: (worldX: number, worldZ: number) => number;
};

export type RoadClearance = {
  readonly distanceToRoad: (worldX: number, worldZ: number) => number;
};

export type ObstacleVisual = {
  readonly position?: { readonly x: number; readonly z: number };
  readonly x?: number;
  readonly z?: number;
  readonly radius?: number;
  readonly scale?: number;
  readonly rotation?: number;
  readonly shape?: "box";
};

export type RockObstacleVisual = ObstacleVisual & {
  readonly id: string;
  readonly position: { readonly x: number; readonly z: number };
  readonly radius: number;
};

export type StructureVisual = {
  readonly id: string;
  readonly structure: "building" | "watchtower" | "checkpoint" | "base";
  readonly position: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
  };
  readonly yaw: number;
  readonly width: number;
  readonly depth: number;
  readonly height: number;
};

export type LocationKindVisual = "crossroads" | "outpost" | "town" | "base";

export type LocationSiteVisual = {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly kind?: LocationKindVisual;
  readonly siteOffset?: readonly [number, number];
};

export type RoadPathVisual = {
  readonly width: number;
  readonly x: ArrayLike<number>;
  readonly z: ArrayLike<number>;
  readonly dx: ArrayLike<number>;
  readonly dz: ArrayLike<number>;
  readonly dist: ArrayLike<number>;
};

export type RoadChunkRefVisual = {
  readonly path: RoadPathVisual;
  readonly from: number;
  readonly to: number;
};
