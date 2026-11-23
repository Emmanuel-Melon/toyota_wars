import {
  cardinalBearing,
  distance2D,
  formatDistance,
} from "@/lib/missions/missions.navigation";
import type { MinimapState } from "./types";

/** Writes distance/bearing into the header spans. Called once per frame. */
export function updateNav(
  distanceEl: HTMLSpanElement | null,
  bearingEl: HTMLSpanElement | null,
  state: MinimapState,
): void {
  if (!distanceEl || !bearingEl) return;

  const target = state.objective?.targetPoint;
  if (!target) {
    distanceEl.textContent = "—";
    bearingEl.textContent = "";
    return;
  }

  const { x, z } = state.playerBody.position;
  distanceEl.textContent = formatDistance(distance2D(x, z, target));
  bearingEl.textContent = cardinalBearing(x, z, target);
}
