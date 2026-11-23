// lib/map/map.world.ts
export const LOCATION_IDS = {
  crossroads: "crossroads",
  outpostAlpha: "outpost-alpha",
  oasisTown: "oasis-town",
  borderBase: "border-base",
} as const;
export type LocationId = (typeof LOCATION_IDS)[keyof typeof LOCATION_IDS];

export type LocationKind = "crossroads" | "outpost" | "town" | "base";

export type LocationDef = {
  id: LocationId;
  name: string;
  kind: LocationKind;
  x: number;
  z: number;
  padRadius: number; // flattened plateau radius
  siteOffset?: readonly [number, number];
};

export type RoadDef = {
  id: string;
  from: LocationId;
  to: LocationId;
  width?: number;
  wobble?: number; // metres of sideways meander
  via?: readonly (readonly [number, number])[]; // forced waypoints (x, z)
};

export type WorldDef = {
  locations: readonly LocationDef[];
  roads: readonly RoadDef[];
};

export const WORLD: WorldDef = {
  locations: [
    {
      id: "crossroads",
      name: "The Crossroads",
      kind: "crossroads",
      x: 0,
      z: 0,
      padRadius: 18,
    },
    {
      id: "outpost-alpha",
      name: "Outpost Alpha",
      kind: "outpost",
      x: 1800,
      z: -400,
      padRadius: 35,
    },
    {
      id: "oasis-town",
      name: "Oasis Town",
      kind: "town",
      x: -1500,
      z: 1200,
      padRadius: 60,
    },
    {
      id: "border-base",
      name: "Border Base",
      kind: "base",
      x: 600,
      z: 2600,
      padRadius: 55,
    },
  ],
  roads: [
    { id: "r-alpha", from: "crossroads", to: "outpost-alpha" },
    { id: "r-oasis", from: "crossroads", to: "oasis-town", wobble: 90 },
    { id: "r-border", from: "crossroads", to: "border-base" },
    {
      id: "r-ring",
      from: "oasis-town",
      to: "border-base",
      via: [[-600, 2300]],
    },
  ],
};

const LOCAL_LOCATION_IDS = [
  LOCATION_IDS.crossroads,
  LOCATION_IDS.outpostAlpha,
  LOCATION_IDS.oasisTown,
  LOCATION_IDS.borderBase,
] as const;

const LOCAL_LOCATION_KINDS: readonly LocationKind[] = [
  "crossroads",
  "outpost",
  "town",
  "base",
];

/** Builds an arena-local WorldDef so mission roads stay inside the playable area. */
export function createArenaWorld(
  waypoints: readonly (readonly [number, number])[],
  width: number,
): WorldDef {
  if (waypoints.length < 2) {
    throw new Error("An arena road network needs at least two waypoints");
  }

  const junctionCount = Math.min(waypoints.length, LOCAL_LOCATION_IDS.length);
  const junctionWaypoints = waypoints.slice(0, junctionCount);
  if (waypoints.length > junctionCount) {
    junctionWaypoints[junctionCount - 1] = waypoints[waypoints.length - 1];
  }

  const padRadius = Math.max(8, Math.min(width, 18));
  const siteDistance = Math.max(3, Math.min(padRadius - 2, width / 2 + 4));
  const locations: LocationDef[] = junctionWaypoints.map((point, index) => {
    const previous = junctionWaypoints[index - 1] ?? point;
    const next = junctionWaypoints[index + 1] ?? point;
    const dx = next[0] - previous[0];
    const dz = next[1] - previous[1];
    const length = Math.hypot(dx, dz) || 1;
    const side = index % 2 === 0 ? 1 : -1;
    return {
      id: LOCAL_LOCATION_IDS[index],
      name: `Arena junction ${index + 1}`,
      kind: LOCAL_LOCATION_KINDS[index],
      x: point[0],
      z: point[1],
      padRadius,
      siteOffset: [
        (-dz / length) * siteDistance * side,
        (dx / length) * siteDistance * side,
      ],
    };
  });

  const via = waypoints
    .slice(junctionCount - 1, -1)
    .map(([x, z]): readonly [number, number] => [x, z]);
  const roads: RoadDef[] = locations.slice(1).map((location, index) => ({
    id: `arena-road-${index}`,
    from: locations[index].id,
    to: location.id,
    width,
    wobble: Math.max(2, Math.min(6, width * 0.5)),
    ...(index === locations.length - 2 ? { via } : {}),
  }));

  return { locations, roads };
}
