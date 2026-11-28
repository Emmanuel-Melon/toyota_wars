// packages/models/src/vehicle/components/pickup/pickup-hull.tsx
"use client";

import type { PickupHullVisualProps } from "../../types";
import { PickupBed } from "./pickup-bed";
import { PickupCab } from "./pickup-cab";
import { PickupShell } from "./pickup-shell";
import { HoodPanelVisual } from "../parts/hood-panel";

export function PickupHullVisual({
  materials,
  doors,
  windows,
  hood,
  children,
  cutaway = true,
}: PickupHullVisualProps) {
  return (
    <>
      <PickupCab materials={materials} doors={doors} windows={windows} cutaway={cutaway} />
      {hood ?? <HoodPanelVisual paintMat={materials.paint} />}
      <PickupShell materials={materials}>
        <PickupBed materials={materials} />
        {children}
      </PickupShell>
    </>
  );
}