"use client";

import { useState } from "react";
import styles from "./rotate-device-overlay.module.css";

type LockableOrientation = {
  lock?: (orientation: "landscape") => Promise<void>;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>;
};

export function RotateDeviceOverlay() {
  const [lockUnavailable, setLockUnavailable] = useState(false);

  const handlePlay = async () => {
    const element = document.documentElement as FullscreenElement;

    try {
      if (!document.fullscreenElement) {
        if (typeof element.requestFullscreen === "function") {
          await element.requestFullscreen();
        } else if (typeof element.webkitRequestFullscreen === "function") {
          await element.webkitRequestFullscreen();
        } else {
          setLockUnavailable(true);
          return;
        }
      }

      const orientation = screen.orientation as LockableOrientation | undefined;
      if (!orientation?.lock) {
        setLockUnavailable(true);
        return;
      }

      await orientation.lock("landscape");
    } catch {
      setLockUnavailable(true);
    }
  };

  return (
    <div
      className={styles.overlay}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="rotate-title"
      aria-describedby="rotate-description"
    >
      <div className={styles.card}>
        <div className={styles.device} aria-hidden="true">
          <div className={styles.deviceScreen} />
        </div>
        <p className={styles.kicker}>LANDSCAPE REQUIRED</p>
        <h2 id="rotate-title" className={styles.title}>
          Rotate your device
        </h2>
        <p id="rotate-description" className={styles.description}>
          Toyota Wars is built for landscape play. Turn your device sideways to
          continue.
        </p>
        <button type="button" className={styles.button} onClick={handlePlay}>
          Play fullscreen
        </button>
        <p className={styles.hint}>
          {lockUnavailable
            ? "Rotation lock is unavailable here — rotate the device manually."
            : "Fullscreen locks landscape where supported."}
        </p>
      </div>
    </div>
  );
}
