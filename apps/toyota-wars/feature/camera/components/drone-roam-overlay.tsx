"use client";

import { useCameraMode } from "@/context/camera-mode-context";
import { useViewport } from "@/context/viewport-context";
import { HudButton } from "@/feature/hud/components/hud-parts";
import { DroneRoamTouchControls } from "./drone-roam-touch-controls";
import styles from "./drone-roam-overlay.module.css";

export function DroneRoamOverlay() {
  const { cycleMode } = useCameraMode();
  const { isTouch } = useViewport();

  return (
    <>
      <div className={styles.frame} aria-hidden="true">
        <span className={`${styles.corner} ${styles.topLeft}`} />
        <span className={`${styles.corner} ${styles.topRight}`} />
        <span className={`${styles.corner} ${styles.bottomLeft}`} />
        <span className={`${styles.corner} ${styles.bottomRight}`} />
      </div>
      <div className={styles.crosshair} aria-hidden="true" />
      <div className={styles.status}>
        <span className={styles.label}>RECON DRONE · ROAM</span>
        <HudButton
          className={styles.exitButton}
          shortcut="V"
          onClick={cycleMode}
        >
          EXIT
        </HudButton>
      </div>
      {isTouch && <DroneRoamTouchControls />}
    </>
  );
}
