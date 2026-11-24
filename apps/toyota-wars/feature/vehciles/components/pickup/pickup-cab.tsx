"use client";

import { Vehicle } from "@toyota/models";
import type { VehiclePart } from "@/lib/combat/combat.teams";
import {
  WindshieldPanel,
  RearWindowPanel,
  SideGlassPanel,
  DoorPanel,
} from "../parts";

const DOORS: readonly { part: VehiclePart; side: number; z: number }[] = [
  { part: "doorFL", side: 1, z: 0.34 },
  { part: "doorFR", side: -1, z: 0.34 },
  { part: "doorRL", side: 1, z: -0.48 },
  { part: "doorRR", side: -1, z: -0.48 },
];

const SIDE_WINDOWS: readonly { part: VehiclePart; side: number; z: number }[] =
  [
    { part: "windowFL", side: 1, z: 0.34 },
    { part: "windowFR", side: -1, z: 0.34 },
    { part: "windowRL", side: 1, z: -0.48 },
    { part: "windowRR", side: -1, z: -0.48 },
  ];

export function PickupCab({
  materials,
}: {
  materials: Vehicle.VehicleMaterials;
}) {
  const windows = (
    <>
      <WindshieldPanel
        glassMat={materials.glass}
        crackMat={materials.glassCrack}
      />
      <RearWindowPanel
        glassMat={materials.glass}
        crackMat={materials.glassCrack}
      />
      {SIDE_WINDOWS.map(({ part, side, z }) => (
        <SideGlassPanel
          key={part}
          part={part}
          side={side}
          z={z}
          glassMat={materials.glass}
          crackMat={materials.glassCrack}
        />
      ))}
    </>
  );

  const doors = DOORS.map(({ part, side, z }) => (
    <DoorPanel
      key={part}
      part={part}
      side={side}
      z={z}
      paintMat={materials.paint}
      chromeMat={materials.chrome}
      darkMat={materials.dark}
    />
  ));

  return (
    <Vehicle.PickupCab materials={materials} windows={windows} doors={doors} />
  );
}
